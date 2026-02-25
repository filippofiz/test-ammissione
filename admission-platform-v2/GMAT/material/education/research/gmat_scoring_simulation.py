"""
GMAT Focus Edition Scoring Algorithm — Monte Carlo Validation Simulation

This script simulates the full GMAT test-taking and scoring pipeline:
  1. Generate synthetic test-taker populations with varying ability levels
  2. Simulate item-by-item adaptive testing (CAT) using the 3PL IRT model
  3. Estimate theta via MLE (Newton-Raphson) for each section
  4. Convert theta → section scores (60-90) → total scores (205-805)
  5. Compare the resulting score distribution against GMAC official data:
     - Mean: 554.67
     - SD: 91.19
     - Full percentile table (from score report images)

Output: A series of diagnostic plots saved to the research/ directory.

Author: UpToTen GMAT Preparation Division
Date: February 2026
"""

import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for faster rendering
import matplotlib.pyplot as plt
from scipy import stats
import warnings
import sys
import time
warnings.filterwarnings('ignore')

# Force unbuffered output
sys.stdout.reconfigure(line_buffering=True)

# ============================================================================
# ALGORITHM CONSTANTS (mirrored from gmatScoringAlgorithm.ts)
# ============================================================================

SECTION_CONFIG = {
    'QR': {'n_questions': 21, 'guessing': 0.17, 'a_mean': 1.60, 'a_sd': 0.30},
    'VR': {'n_questions': 23, 'guessing': 0.17, 'a_mean': 1.10, 'a_sd': 0.25},
    'DI': {'n_questions': 20, 'guessing': 0.14, 'a_mean': 1.20, 'a_sd': 0.30},
}

THETA_TO_SCORE = {'intercept': 75, 'slope': 10, 'min': 60, 'max': 90}
WARM_START_FACTOR = 0.3

# Official GMAC percentile table (from score report images — updated values)
OFFICIAL_PERCENTILE_TABLE = {
    805: 100, 795: 100, 785: 100, 775: 100, 765: 100, 755: 100, 745: 100, 735: 100,
    725: 99, 715: 99, 705: 98, 695: 97, 685: 96, 675: 95,
    665: 92, 655: 91, 645: 87, 635: 82, 625: 79, 615: 76,
    605: 70, 595: 67, 585: 61, 575: 57, 565: 51, 555: 48,
    545: 42, 535: 39, 525: 34, 515: 32, 505: 27, 495: 25,
    485: 21, 475: 20, 465: 17, 455: 15, 445: 13, 435: 12,
    425: 10, 415: 9, 405: 7, 395: 6, 385: 5, 375: 5,
    365: 4, 355: 3, 345: 3, 335: 2, 325: 2, 315: 2,
    305: 1, 295: 1, 285: 1, 275: 1, 265: 1,
    255: 0, 245: 0, 235: 0, 225: 0, 215: 0, 205: 0,
}

OFFICIAL_MEAN = 554.67
OFFICIAL_SD = 91.19


# ============================================================================
# 3PL IRT MODEL (vectorized where possible)
# ============================================================================

def icc_3pl(theta, a, b, c):
    """3PL Item Characteristic Curve."""
    exponent = np.clip(-a * (theta - b), -40, 40)
    return c + (1 - c) / (1 + np.exp(exponent))


def fisher_info(theta, a, b, c):
    """Fisher information for a 3PL item."""
    p = icc_3pl(theta, a, b, c)
    p = np.clip(p, 1e-10, 1 - 1e-10)
    q = 1 - p
    w = a * (p - c) / (1 - c)
    return w**2 * q / p


# ============================================================================
# OPTIMIZED CAT SIMULATION
# ============================================================================

def generate_item_bank_arrays(n_items, section, rng):
    """Generate item bank as numpy arrays for fast access."""
    cfg = SECTION_CONFIG[section]
    a = np.maximum(0.3, rng.normal(cfg['a_mean'], cfg['a_sd'], n_items))
    b = np.clip(rng.normal(0.0, 1.2, n_items), -3.0, 3.0)

    c_mean = cfg['guessing']
    c = np.clip(rng.normal(c_mean, 0.04, n_items), 0.01, 0.35)

    return a, b, c


def simulate_cat_fast(true_theta, n_questions, a_bank, b_bank, c_bank, rng,
                      initial_theta=0.0):
    """
    Simulate adaptive test for one examinee — optimized version.

    Uses Maximum Fisher Information item selection and MLE theta estimation.
    """
    n_bank = len(a_bank)
    used = np.zeros(n_bank, dtype=bool)
    responses = []
    used_indices = []
    theta_est = initial_theta

    for q in range(n_questions):
        # --- Item selection: Maximum Fisher Information ---
        available = ~used
        if not np.any(available):
            break

        # Compute Fisher info for all available items at current theta
        info = fisher_info(theta_est, a_bank, b_bank, c_bank)
        info[used] = -1  # Mask used items
        best_idx = np.argmax(info)

        used[best_idx] = True
        a_i, b_i, c_i = a_bank[best_idx], b_bank[best_idx], c_bank[best_idx]

        # --- Simulate response ---
        p_correct = icc_3pl(true_theta, a_i, b_i, c_i)
        response = 1 if rng.random() < p_correct else 0
        responses.append(response)
        used_indices.append(best_idx)

        # --- Update theta estimate via MLE (Newton-Raphson) ---
        if q < 2:
            # EAP for first few items
            theta_est = _eap_quick(responses, used_indices, a_bank, b_bank, c_bank,
                                   initial_theta)
        else:
            theta_est = _mle_quick(responses, used_indices, a_bank, b_bank, c_bank,
                                   theta_est)

    # Compute final SE
    a_used = a_bank[used_indices]
    b_used = b_bank[used_indices]
    c_used = c_bank[used_indices]
    total_info = np.sum(fisher_info(theta_est, a_used, b_used, c_used))
    se = 1.0 / np.sqrt(max(total_info, 1e-10))

    n_correct = sum(responses)
    return theta_est, se, n_correct


def _mle_quick(responses, used_indices, a_bank, b_bank, c_bank, theta_init):
    """Fast MLE via Newton-Raphson (using numpy arrays)."""
    resp = np.array(responses)
    a = a_bank[used_indices]
    b = b_bank[used_indices]
    c = c_bank[used_indices]

    theta = theta_init

    for _ in range(30):
        p = np.clip(icc_3pl(theta, a, b, c), 1e-10, 1 - 1e-10)
        q = 1 - p
        w = a * (p - c) / (1 - c)

        L1 = np.sum(w * (resp - p) / (p * q))
        L2 = np.sum(-(w**2) / (p * q))

        if abs(L2) < 1e-10:
            break

        delta = L1 / L2
        theta = np.clip(theta - delta, -4.0, 4.0)

        if abs(delta) < 0.001:
            break

    return float(theta)


def _eap_quick(responses, used_indices, a_bank, b_bank, c_bank, prior_mean):
    """Quick EAP estimation with N(prior_mean, 1) prior."""
    quad = np.linspace(-4, 4, 41)
    prior = stats.norm.pdf(quad, prior_mean, 1.0)

    resp = np.array(responses)
    a = a_bank[used_indices]
    b = b_bank[used_indices]
    c = c_bank[used_indices]

    # Compute likelihood at each quadrature point
    log_lik = np.zeros(len(quad))
    for j in range(len(resp)):
        p = np.clip(icc_3pl(quad, a[j], b[j], c[j]), 1e-10, 1 - 1e-10)
        if resp[j] == 1:
            log_lik += np.log(p)
        else:
            log_lik += np.log(1 - p)

    # Numerically stable posterior
    log_posterior = log_lik + np.log(prior + 1e-30)
    log_posterior -= np.max(log_posterior)
    posterior = np.exp(log_posterior)
    posterior /= np.sum(posterior)

    return float(np.sum(quad * posterior))


# ============================================================================
# SCORING FUNCTIONS (mirrored from gmatScoringAlgorithm.ts)
# ============================================================================

def theta_to_section_score(theta):
    """Convert theta to section score (60-90)."""
    raw = THETA_TO_SCORE['intercept'] + theta * THETA_TO_SCORE['slope']
    clamped = max(THETA_TO_SCORE['min'], min(THETA_TO_SCORE['max'], raw))
    return round(clamped)


def compute_total_score(qr, vr, di):
    """Compute total GMAT score (205-805) from three section scores."""
    raw = (qr + vr + di - 180) * (20 / 3) + 205
    rounded = round(raw / 10) * 10
    total = rounded + 5 if rounded % 10 == 0 else rounded
    return max(205, min(805, total))


# Vectorized versions for batch processing
def theta_to_section_score_vec(thetas):
    raw = THETA_TO_SCORE['intercept'] + thetas * THETA_TO_SCORE['slope']
    clamped = np.clip(raw, THETA_TO_SCORE['min'], THETA_TO_SCORE['max'])
    return np.round(clamped).astype(int)


def compute_total_score_vec(qr, vr, di):
    raw = (qr + vr + di - 180) * (20 / 3) + 205
    rounded = np.round(raw / 10).astype(int) * 10
    total = np.where(rounded % 10 == 0, rounded + 5, rounded)
    return np.clip(total, 205, 805)


# ============================================================================
# MAIN SIMULATION
# ============================================================================

def run_simulation(n_examinees=10000, seed=42):
    """Run full Monte Carlo simulation."""
    rng = np.random.default_rng(seed)

    print(f"{'='*70}")
    print(f"GMAT Focus Edition — Monte Carlo Scoring Simulation")
    print(f"{'='*70}")
    print(f"Examinees: {n_examinees:,}")
    print(f"Seed: {seed}")
    print()

    # --- Draw true abilities from multivariate normal ---
    # Moderate positive correlations between sections
    correlations = np.array([
        [1.0, 0.5, 0.6],  # QR-VR, QR-DI
        [0.5, 1.0, 0.5],  # VR-QR, VR-DI
        [0.6, 0.5, 1.0],  # DI-QR, DI-VR
    ])
    true_thetas = rng.multivariate_normal([0, 0, 0], correlations, n_examinees)

    # --- Generate item banks (shared across all examinees for consistency) ---
    print("Generating item banks...")
    bank_size = 150  # Enough for adaptive selection
    qr_a, qr_b, qr_c = generate_item_bank_arrays(bank_size, 'QR', rng)
    vr_a, vr_b, vr_c = generate_item_bank_arrays(bank_size, 'VR', rng)
    di_a, di_b, di_c = generate_item_bank_arrays(bank_size, 'DI', rng)

    # --- Simulate each examinee ---
    est_theta = np.zeros((n_examinees, 3))
    se = np.zeros((n_examinees, 3))
    n_correct = np.zeros((n_examinees, 3), dtype=int)

    progress_step = max(1, n_examinees // 10)
    t0 = time.time()

    for i in range(n_examinees):
        if (i + 1) % progress_step == 0:
            elapsed = time.time() - t0
            rate = (i + 1) / elapsed
            remaining = (n_examinees - i - 1) / rate
            print(f"  [{i+1:>6,}/{n_examinees:,}] {100*(i+1)/n_examinees:5.1f}% "
                  f"| {elapsed:.0f}s elapsed | ~{remaining:.0f}s remaining")

        # Section 1: QR
        est_theta[i, 0], se[i, 0], n_correct[i, 0] = simulate_cat_fast(
            true_thetas[i, 0], 21, qr_a, qr_b, qr_c, rng, initial_theta=0.0
        )

        # Section 2: VR (warm start from QR)
        warm_vr = est_theta[i, 0] * WARM_START_FACTOR
        est_theta[i, 1], se[i, 1], n_correct[i, 1] = simulate_cat_fast(
            true_thetas[i, 1], 23, vr_a, vr_b, vr_c, rng, initial_theta=warm_vr
        )

        # Section 3: DI (warm start from VR)
        warm_di = est_theta[i, 1] * WARM_START_FACTOR
        est_theta[i, 2], se[i, 2], n_correct[i, 2] = simulate_cat_fast(
            true_thetas[i, 2], 20, di_a, di_b, di_c, rng, initial_theta=warm_di
        )

    elapsed = time.time() - t0
    print(f"\nSimulation complete in {elapsed:.1f}s ({n_examinees/elapsed:.0f} examinees/sec)")

    # --- Compute scores ---
    section_scores = np.zeros((n_examinees, 3), dtype=int)
    for j in range(3):
        section_scores[:, j] = theta_to_section_score_vec(est_theta[:, j])

    total_scores = compute_total_score_vec(
        section_scores[:, 0], section_scores[:, 1], section_scores[:, 2]
    )

    return {
        'true_theta': true_thetas,
        'est_theta': est_theta,
        'se': se,
        'n_correct': n_correct,
        'section_scores': section_scores,
        'total_scores': total_scores,
    }


# ============================================================================
# ANALYSIS & PLOTTING
# ============================================================================

def compute_sim_percentiles(total_scores):
    """Compute percentile from simulated distribution."""
    result = {}
    for score in OFFICIAL_PERCENTILE_TABLE:
        result[score] = round(100.0 * np.mean(total_scores < score))
    return result


def analyze_and_plot(results, output_dir):
    """Generate all analysis output and plots."""
    total_scores = results['total_scores']
    section_scores = results['section_scores']
    true_theta = results['true_theta']
    est_theta = results['est_theta']
    n_correct = results['n_correct']

    sim_mean = np.mean(total_scores)
    sim_sd = np.std(total_scores)
    sim_median = np.median(total_scores)

    # =====================================================================
    # CONSOLE SUMMARY
    # =====================================================================
    print(f"\n{'='*70}")
    print(f"RESULTS SUMMARY")
    print(f"{'='*70}")
    print(f"{'Metric':<35} {'Simulated':>12} {'Official':>12} {'Delta':>10}")
    print(f"{'-'*70}")
    print(f"{'Mean Total Score':<35} {sim_mean:>12.2f} {OFFICIAL_MEAN:>12.2f} {sim_mean - OFFICIAL_MEAN:>+10.2f}")
    print(f"{'Std Deviation':<35} {sim_sd:>12.2f} {OFFICIAL_SD:>12.2f} {sim_sd - OFFICIAL_SD:>+10.2f}")
    print(f"{'Median':<35} {sim_median:>12.1f} {'~555':>12}")
    print(f"{'Min':<35} {np.min(total_scores):>12.0f} {'205':>12}")
    print(f"{'Max':<35} {np.max(total_scores):>12.0f} {'805':>12}")
    print()

    sec_names = ['QR', 'VR', 'DI']
    print(f"Section Scores:")
    for j, name in enumerate(sec_names):
        s = section_scores[:, j]
        print(f"  {name}: mean={np.mean(s):.1f}, sd={np.std(s):.1f}, "
              f"range=[{np.min(s)}, {np.max(s)}]")

    print(f"\nTheta Estimation Accuracy:")
    for j, name in enumerate(sec_names):
        corr = np.corrcoef(true_theta[:, j], est_theta[:, j])[0, 1]
        rmse = np.sqrt(np.mean((true_theta[:, j] - est_theta[:, j])**2))
        print(f"  {name}: r={corr:.4f}, RMSE={rmse:.3f}, mean_SE={np.mean(results['se'][:, j]):.3f}")

    # Percentile comparison
    sim_pct = compute_sim_percentiles(total_scores)

    print(f"\n{'='*70}")
    print(f"PERCENTILE COMPARISON (every 20 points)")
    print(f"{'='*70}")
    print(f"{'Score':<8} {'Official':>10} {'Simulated':>10} {'Delta':>8}")
    print(f"{'-'*38}")

    total_abs_err = 0
    n_pts = 0
    n_within_2 = 0
    n_within_5 = 0

    for score in sorted(OFFICIAL_PERCENTILE_TABLE.keys(), reverse=True):
        official = OFFICIAL_PERCENTILE_TABLE[score]
        simulated = sim_pct.get(score, 0)
        delta = simulated - official
        total_abs_err += abs(delta)
        n_pts += 1
        if abs(delta) <= 2:
            n_within_2 += 1
        elif abs(delta) <= 5:
            n_within_5 += 1

        if score % 20 == 5:
            print(f"{score:<8} {official:>9}% {simulated:>9}% {delta:>+7}%")

    mae = total_abs_err / n_pts
    print(f"\nMAE: {mae:.2f}%")
    print(f"Within ±2%: {n_within_2}/{n_pts} ({100*n_within_2/n_pts:.1f}%)")
    print(f"Within ±5%: {n_within_2 + n_within_5}/{n_pts} ({100*(n_within_2+n_within_5)/n_pts:.1f}%)")

    # KS test
    ks_stat, ks_pval = stats.kstest(total_scores, 'norm', args=(OFFICIAL_MEAN, OFFICIAL_SD))
    print(f"\nKS test vs N({OFFICIAL_MEAN}, {OFFICIAL_SD}²): D={ks_stat:.4f}, p={ks_pval:.2e}")

    # =====================================================================
    # FIGURE 1: Main Distribution Comparison (2x2)
    # =====================================================================
    print("\nGenerating plots...")

    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle('GMAT Focus Edition Scoring Algorithm — Distribution Validation',
                 fontsize=16, fontweight='bold', y=0.98)

    # Panel A: Total Score Histogram with KDE overlay
    # Use wider bins (30pt) to smooth the "bouncy" artifact caused by
    # the discrete section-score-to-total-score mapping (20/3 factor
    # creates non-uniform reachability across the 10-point score grid).
    from scipy.stats import gaussian_kde
    ax = axes[0, 0]
    bins_wide = np.arange(190, 821, 30)
    ax.hist(total_scores, bins=bins_wide, density=True, alpha=0.35,
            color='#2196F3', edgecolor='white', label='Simulated (hist)')
    # KDE overlay for the smooth underlying distribution
    kde = gaussian_kde(total_scores, bw_method=0.15)
    x = np.linspace(205, 805, 300)
    ax.plot(x, kde(x), '-', color='#1565C0', lw=2.5, label='Simulated (KDE)')
    ax.plot(x, stats.norm.pdf(x, OFFICIAL_MEAN, OFFICIAL_SD), 'r-', lw=2.5,
            label=f'Official N({OFFICIAL_MEAN:.0f}, {OFFICIAL_SD:.0f}$^2$)')

    ax.set_xlabel('Total Score', fontsize=12)
    ax.set_ylabel('Density', fontsize=12)
    ax.set_title('A. Total Score Distribution', fontsize=13, fontweight='bold')
    ax.legend(fontsize=10)
    ax.set_xlim(200, 810)

    text = (f'Simulated: $\\mu$={sim_mean:.1f}, $\\sigma$={sim_sd:.1f}\n'
            f'Official:  $\\mu$={OFFICIAL_MEAN:.1f}, $\\sigma$={OFFICIAL_SD:.1f}\n'
            f'$\\Delta\\mu$ = {sim_mean - OFFICIAL_MEAN:+.1f}, $\\Delta\\sigma$ = {sim_sd - OFFICIAL_SD:+.1f}')
    ax.text(0.02, 0.97, text, transform=ax.transAxes, fontsize=9,
            va='top', bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

    # Panel B: Percentile Curves
    ax = axes[0, 1]
    off_scores = sorted(OFFICIAL_PERCENTILE_TABLE.keys())
    off_pcts = [OFFICIAL_PERCENTILE_TABLE[s] for s in off_scores]
    sim_pcts_list = [sim_pct.get(s, 0) for s in off_scores]

    ax.plot(off_scores, off_pcts, 'ro-', ms=3, lw=1.5, label='Official (GMAC)', alpha=0.8)
    ax.plot(off_scores, sim_pcts_list, 'b^-', ms=3, lw=1.5, label='Simulated', alpha=0.8)
    ax.set_xlabel('Total Score', fontsize=12)
    ax.set_ylabel('Percentile Ranking (%)', fontsize=12)
    ax.set_title('B. Percentile Curve: Official vs Simulated', fontsize=13, fontweight='bold')
    ax.legend(fontsize=10)
    ax.set_xlim(200, 810)
    ax.set_ylim(-2, 102)
    ax.grid(True, alpha=0.3)

    # Panel C: Percentile Error
    ax = axes[1, 0]
    pct_errors = [sim_pcts_list[i] - off_pcts[i] for i in range(len(off_scores))]
    colors = ['#F44336' if abs(e) > 5 else '#FF9800' if abs(e) > 2 else '#4CAF50'
              for e in pct_errors]
    ax.bar(off_scores, pct_errors, width=8, color=colors, alpha=0.8, edgecolor='white')
    ax.axhline(0, color='black', lw=0.8)
    ax.axhline(5, color='red', lw=0.5, ls='--', alpha=0.5)
    ax.axhline(-5, color='red', lw=0.5, ls='--', alpha=0.5)
    ax.set_xlabel('Total Score', fontsize=12)
    ax.set_ylabel('Percentile Error (Sim - Official)', fontsize=12)
    ax.set_title('C. Percentile Deviation from Official', fontsize=13, fontweight='bold')
    ax.set_xlim(200, 810)

    mae_val = np.mean(np.abs(pct_errors))
    max_err = max(pct_errors, key=abs)
    ax.text(0.02, 0.97, f'MAE: {mae_val:.1f}%\nMax Error: {max_err:+.0f}%',
            transform=ax.transAxes, fontsize=10, va='top',
            bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

    # Panel D: Section Scores with KDE overlay
    ax = axes[1, 1]
    section_bins = np.arange(58.5, 92.5, 2)  # wider bins (2pt) for cleaner look
    sec_x = np.linspace(59, 91, 200)
    for j, (name, color, dark) in enumerate([('QR', '#F44336', '#B71C1C'), ('VR', '#2196F3', '#0D47A1'), ('DI', '#4CAF50', '#1B5E20')]):
        ax.hist(section_scores[:, j], bins=section_bins, density=True, alpha=0.25,
                color=color, edgecolor='white')
        sec_kde = gaussian_kde(section_scores[:, j], bw_method=0.3)
        ax.plot(sec_x, sec_kde(sec_x), '-', color=dark, lw=2,
                label=f"{name} ($\\mu$={np.mean(section_scores[:, j]):.1f})")
    ax.set_xlabel('Section Score', fontsize=12)
    ax.set_ylabel('Density', fontsize=12)
    ax.set_title('D. Section Score Distributions', fontsize=13, fontweight='bold')
    ax.legend(fontsize=10)
    ax.set_xlim(58, 92)

    plt.tight_layout(rect=[0, 0, 1, 0.96])
    fig.savefig(f'{output_dir}/simulation_results_distribution.png', dpi=150, bbox_inches='tight')
    print(f"  Saved: simulation_results_distribution.png")

    # =====================================================================
    # FIGURE 2: Theta Estimation Accuracy (2x3)
    # =====================================================================
    fig, axes = plt.subplots(2, 3, figsize=(18, 10))
    fig.suptitle('CAT Performance & Theta Estimation Accuracy',
                 fontsize=16, fontweight='bold', y=0.98)

    sec_colors = ['#F44336', '#2196F3', '#4CAF50']
    n_q = [21, 23, 20]
    rng_plot = np.random.default_rng(0)

    for j, (name, color) in enumerate(zip(sec_names, sec_colors)):
        # Row 1: True vs Estimated theta
        ax = axes[0, j]
        n_plot = min(3000, len(true_theta))
        idx = rng_plot.choice(len(true_theta), n_plot, replace=False)

        corr = np.corrcoef(true_theta[:, j], est_theta[:, j])[0, 1]
        ax.scatter(true_theta[idx, j], est_theta[idx, j], alpha=0.15, s=8, color=color)
        ax.plot([-3.5, 3.5], [-3.5, 3.5], 'k--', lw=1)

        slope, intercept = np.polyfit(true_theta[:, j], est_theta[:, j], 1)
        xl = np.linspace(-3, 3, 100)
        ax.plot(xl, slope * xl + intercept, color='orange', lw=2,
                label=f'Fit: y={slope:.2f}x{intercept:+.2f}')

        ax.set_xlabel('True θ', fontsize=11)
        ax.set_ylabel('Estimated θ', fontsize=11)
        ax.set_title(f'{name}: True vs Est θ (r={corr:.3f})', fontsize=12, fontweight='bold')
        ax.legend(fontsize=9)
        ax.set_xlim(-3.5, 3.5)
        ax.set_ylim(-3.5, 3.5)
        ax.set_aspect('equal')
        ax.grid(True, alpha=0.2)

        # Row 2: Correct answers vs section score
        ax = axes[1, j]
        hb = ax.hexbin(n_correct[:, j], section_scores[:, j], gridsize=15,
                        cmap='YlOrRd', mincnt=1)
        plt.colorbar(hb, ax=ax, label='Count')
        ax.set_xlabel(f'Correct (of {n_q[j]})', fontsize=11)
        ax.set_ylabel('Section Score', fontsize=11)
        ax.set_title(f'{name}: Correct → Score', fontsize=12, fontweight='bold')
        ax.set_ylim(58, 92)

    plt.tight_layout(rect=[0, 0, 1, 0.96])
    fig.savefig(f'{output_dir}/simulation_results_theta.png', dpi=150, bbox_inches='tight')
    print(f"  Saved: simulation_results_theta.png")

    # =====================================================================
    # FIGURE 3: Distribution Fit Analysis (1x3)
    # =====================================================================
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))
    fig.suptitle('Distribution Fit Analysis', fontsize=16, fontweight='bold', y=1.02)

    # Panel A: Q-Q Plot
    ax = axes[0]
    n = len(total_scores)
    sorted_s = np.sort(total_scores)
    theoretical = stats.norm.ppf(np.arange(1, n + 1) / (n + 1), OFFICIAL_MEAN, OFFICIAL_SD)
    step = max(1, n // 2000)
    ax.scatter(theoretical[::step], sorted_s[::step], alpha=0.3, s=8, color='#2196F3')
    ax.plot([200, 810], [200, 810], 'r--', lw=1.5, label='Perfect fit')
    ax.set_xlabel(f'Theoretical (N({OFFICIAL_MEAN:.0f}, {OFFICIAL_SD:.0f}²))', fontsize=11)
    ax.set_ylabel('Simulated Quantiles', fontsize=11)
    ax.set_title('A. Q-Q Plot vs Official', fontsize=13, fontweight='bold')
    ax.legend()
    ax.set_xlim(200, 810)
    ax.set_ylim(200, 810)
    ax.set_aspect('equal')
    ax.grid(True, alpha=0.2)

    # Panel B: CDF Comparison
    ax = axes[1]
    ax.plot(sorted_s, np.arange(1, n + 1) / n * 100, 'b-', lw=2, label='Simulated', alpha=0.8)
    ax.plot(off_scores, off_pcts, 'ro-', ms=3, lw=1.5, label='Official (GMAC)', alpha=0.8)
    xr = np.linspace(205, 805, 300)
    ax.plot(xr, stats.norm.cdf(xr, OFFICIAL_MEAN, OFFICIAL_SD) * 100, 'g--', lw=1.5,
            label=f'N({OFFICIAL_MEAN:.0f}, {OFFICIAL_SD:.0f}²)', alpha=0.7)
    ax.set_xlabel('Total Score', fontsize=11)
    ax.set_ylabel('Cumulative %', fontsize=11)
    ax.set_title('B. CDF Comparison', fontsize=13, fontweight='bold')
    ax.legend(fontsize=9)
    ax.set_xlim(200, 810)
    ax.grid(True, alpha=0.3)

    # Panel C: Score Band Distribution
    ax = axes[2]
    bands = [
        ('Below Avg\n(205-504)', 205, 504),
        ('Average\n(505-604)', 505, 604),
        ('Above Avg\n(605-664)', 605, 664),
        ('Competitive\n(665-714)', 665, 714),
        ('Top Schools\n(715+)', 715, 805),
    ]
    band_pcts = []
    band_colors = ['#F44336', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50']
    for _, lo, hi in bands:
        band_pcts.append(100 * np.mean((total_scores >= lo) & (total_scores <= hi)))

    bars = ax.barh(range(len(bands)), band_pcts, color=band_colors, edgecolor='white',
                    height=0.7, alpha=0.85)
    ax.set_yticks(range(len(bands)))
    ax.set_yticklabels([b[0] for b in bands], fontsize=10)
    ax.set_xlabel('% of Test-Takers', fontsize=11)
    ax.set_title('C. Score Band Distribution', fontsize=13, fontweight='bold')
    for bar, pct in zip(bars, band_pcts):
        ax.text(bar.get_width() + 0.5, bar.get_y() + bar.get_height() / 2,
                f'{pct:.1f}%', va='center', fontsize=11, fontweight='bold')
    ax.set_xlim(0, max(band_pcts) * 1.3)

    plt.tight_layout()
    fig.savefig(f'{output_dir}/simulation_results_fit.png', dpi=150, bbox_inches='tight')
    print(f"  Saved: simulation_results_fit.png")

    # =====================================================================
    # FIGURE 4: Percentile Table (visual)
    # =====================================================================
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.axis('off')

    key_scores = list(range(805, 195, -20))
    table_data = []
    for score in key_scores:
        off = OFFICIAL_PERCENTILE_TABLE.get(score, '—')
        sim = sim_pct.get(score, '—')
        if isinstance(off, (int, float)) and isinstance(sim, (int, float)):
            d = sim - off
            ds = f'{d:+d}'
        else:
            d = None
            ds = '—'
        table_data.append([str(score), str(off), str(sim), ds])

    table = ax.table(cellText=table_data,
                     colLabels=['Score', 'Official %ile', 'Simulated %ile', 'Delta'],
                     cellLoc='center', loc='center')
    table.auto_set_font_size(False)
    table.set_fontsize(11)
    table.scale(1, 1.5)

    for i in range(len(table_data)):
        cell = table[i + 1, 3]
        try:
            dv = int(table_data[i][3])
            if abs(dv) <= 2:
                cell.set_facecolor('#C8E6C9')
            elif abs(dv) <= 5:
                cell.set_facecolor('#FFE0B2')
            else:
                cell.set_facecolor('#FFCDD2')
        except ValueError:
            pass

    for j in range(4):
        table[0, j].set_facecolor('#37474F')
        table[0, j].set_text_props(color='white', fontweight='bold')

    ax.set_title('Percentile Comparison: Official vs Simulated\n'
                 '(Green: ≤2%, Orange: ≤5%, Red: >5%)',
                 fontsize=14, fontweight='bold', pad=20)

    fig.savefig(f'{output_dir}/simulation_results_percentile_table.png', dpi=150, bbox_inches='tight')
    print(f"  Saved: simulation_results_percentile_table.png")

    plt.close('all')
    print(f"\nAll plots saved to: {output_dir}/")

    return sim_pct


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    import os

    output_dir = os.path.dirname(os.path.abspath(__file__))

    t_start = time.time()

    results = run_simulation(n_examinees=10000, seed=42)
    sim_pct = analyze_and_plot(results, output_dir)

    print(f"\nTotal time: {time.time() - t_start:.1f}s")
