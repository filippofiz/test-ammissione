"""
GMAT Scoring Algorithm — Calibration & Validation

Phase 1: Analytical calibration of theta-to-score mapping parameters
Phase 2: Monte Carlo simulation with calibrated parameters
Phase 3: Comparison against GMAC official distribution

The key insight: the section score SD controls the total score SD.
If section_score_sd is too large, total_score_sd will be too large.

Given:
  - Official total score mean: 554.67, SD: 91.19
  - Total = (QR + VR + DI - 180) × 20/3 + 205
  - Section scores: 60-90 (mean ~75.2 for official mean 555)

We need to find the theta→score slope that produces the right SD.

Author: UpToTen GMAT Preparation Division
Date: February 2026
"""

import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from scipy import stats, optimize
import warnings
import sys
import time
warnings.filterwarnings('ignore')

sys.stdout.reconfigure(line_buffering=True)

# ============================================================================
# OFFICIAL TARGET DATA (from GMAC score report images)
# ============================================================================

OFFICIAL_MEAN = 554.67
OFFICIAL_SD = 91.19

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

# ============================================================================
# SECTION CONFIG & IRT
# ============================================================================

SECTION_CONFIG = {
    'QR': {'n_questions': 21, 'a_mean': 1.60, 'a_sd': 0.30, 'c_mean': 0.17},
    'VR': {'n_questions': 23, 'a_mean': 1.10, 'a_sd': 0.25, 'c_mean': 0.17},
    'DI': {'n_questions': 20, 'a_mean': 1.20, 'a_sd': 0.30, 'c_mean': 0.14},
}

WARM_START = 0.3


def icc_3pl(theta, a, b, c):
    exponent = np.clip(-a * (theta - b), -40, 40)
    return c + (1 - c) / (1 + np.exp(exponent))

def fisher_info(theta, a, b, c):
    p = np.clip(icc_3pl(theta, a, b, c), 1e-10, 1 - 1e-10)
    q = 1 - p
    w = a * (p - c) / (1 - c)
    return w**2 * q / p

def generate_bank(n, section, rng):
    cfg = SECTION_CONFIG[section]
    a = np.maximum(0.3, rng.normal(cfg['a_mean'], cfg['a_sd'], n))
    b = np.clip(rng.normal(0.0, 1.2, n), -3.0, 3.0)
    c = np.clip(rng.normal(cfg['c_mean'], 0.04, n), 0.01, 0.35)
    return a, b, c

def mle_theta(resp, idx, a_bank, b_bank, c_bank, theta_init):
    r = np.array(resp)
    a, b, c = a_bank[idx], b_bank[idx], c_bank[idx]
    theta = theta_init
    for _ in range(30):
        p = np.clip(icc_3pl(theta, a, b, c), 1e-10, 1 - 1e-10)
        q = 1 - p
        w = a * (p - c) / (1 - c)
        L1 = np.sum(w * (r - p) / (p * q))
        L2 = np.sum(-(w**2) / (p * q))
        if abs(L2) < 1e-10:
            break
        delta = L1 / L2
        theta = np.clip(theta - delta, -4.0, 4.0)
        if abs(delta) < 0.001:
            break
    return float(theta)

def eap_theta(resp, idx, a_bank, b_bank, c_bank, prior_mean):
    quad = np.linspace(-4, 4, 41)
    r = np.array(resp)
    a, b, c = a_bank[idx], b_bank[idx], c_bank[idx]
    log_lik = np.zeros(len(quad))
    for j in range(len(r)):
        p = np.clip(icc_3pl(quad, a[j], b[j], c[j]), 1e-10, 1 - 1e-10)
        log_lik += np.where(r[j] == 1, np.log(p), np.log(1 - p))
    log_post = log_lik + np.log(stats.norm.pdf(quad, prior_mean, 1.0) + 1e-30)
    log_post -= np.max(log_post)
    post = np.exp(log_post)
    post /= np.sum(post)
    return float(np.sum(quad * post))

def simulate_cat(true_theta, n_q, a_bank, b_bank, c_bank, rng, init_theta=0.0):
    used = np.zeros(len(a_bank), dtype=bool)
    resps, idxs = [], []
    theta_est = init_theta
    for q in range(n_q):
        info = fisher_info(theta_est, a_bank, b_bank, c_bank)
        info[used] = -1
        best = np.argmax(info)
        used[best] = True
        p = icc_3pl(true_theta, a_bank[best], b_bank[best], c_bank[best])
        r = 1 if rng.random() < p else 0
        resps.append(r)
        idxs.append(best)
        if q < 2:
            theta_est = eap_theta(resps, idxs, a_bank, b_bank, c_bank, init_theta)
        else:
            theta_est = mle_theta(resps, idxs, a_bank, b_bank, c_bank, theta_est)
    se_val = 1.0 / np.sqrt(max(np.sum(fisher_info(theta_est, a_bank[idxs], b_bank[idxs], c_bank[idxs])), 1e-10))
    return theta_est, se_val, sum(resps)


# ============================================================================
# PHASE 1: ANALYTICAL CALIBRATION
# ============================================================================

def calibrate_mapping():
    """
    Find the optimal theta→score mapping parameters (intercept, slope)
    that produce the correct total score mean and SD.

    The total score formula is:
      Total = (S_QR + S_VR + S_DI - 180) × 20/3 + 205

    Where S_x = clamp(round(intercept + theta_x × slope), 60, 90)

    The key relationships:
      E[Total] = (3 × E[S] - 180) × 20/3 + 205
      SD[Total] = 20/3 × SD[S_QR + S_VR + S_DI]

    For the official mean 554.67:
      E[S_QR + S_VR + S_DI] = (554.67 - 205) × 3/20 + 180 = 52.45 + 180 = 232.45
      E[S] ≈ 232.45 / 3 = 77.48 (average section score)

    For the official SD 91.19:
      SD[S_QR + S_VR + S_DI] = 91.19 × 3/20 = 13.68

    If sections are correlated with r ≈ 0.5:
      Var[sum] = 3 × Var[S] + 6 × r × Var[S] = 3(1 + 2r) × Var[S]
      SD[sum] = SD[S] × sqrt(3(1 + 2×0.5)) = SD[S] × sqrt(6) ≈ 2.449 × SD[S]
      SD[S] = 13.68 / 2.449 ≈ 5.59

    But theta is N(0,1), so before clamping:
      E[S] = intercept (since E[theta]=0)
      SD[S] ≈ slope × 1.0 (since SD[theta]=1, before clamping)

    So: intercept ≈ 77.48, slope ≈ 5.59

    But clamping at [60,90] truncates the distribution, which:
    - Reduces the SD (probability mass piles up at boundaries)
    - Slightly increases the mean (upward bias from floor at 60)

    We need to account for this. The effective slope should be slightly larger
    to compensate for the variance reduction from clamping.
    """
    print("=" * 70)
    print("PHASE 1: ANALYTICAL CALIBRATION")
    print("=" * 70)

    # Target section score statistics (derived from total score targets)
    target_sum_mean = (OFFICIAL_MEAN - 205) * 3/20 + 180
    target_section_mean = target_sum_mean / 3

    # Compute effective section correlation from simulation data
    # We'll use the theoretical inter-section correlation (~0.5)
    r_sections = 0.50  # Approximate: true correlations are 0.5-0.6

    target_sum_sd = OFFICIAL_SD * 3/20
    target_section_sd = target_sum_sd / np.sqrt(3 * (1 + 2 * r_sections))

    print(f"\nTarget derivations from official data:")
    print(f"  Official total:  mean={OFFICIAL_MEAN}, SD={OFFICIAL_SD}")
    print(f"  -> Sum of 3 sections: mean={target_sum_mean:.2f}, SD={target_sum_sd:.2f}")
    print(f"  -> Per section:       mean={target_section_mean:.2f}, SD={target_section_sd:.2f}")
    print(f"  -> Initial guess:     intercept={target_section_mean:.1f}, slope={target_section_sd:.1f}")

    # Now use numerical optimization to find the exact intercept and slope
    # that produce the right mean and SD after clamping [60, 90]

    def objective(params):
        intercept, slope = params
        # Simulate the clamped distribution analytically using numerical integration
        # theta ~ N(0, 1)
        n_points = 10000
        rng_cal = np.random.default_rng(123)
        thetas = rng_cal.standard_normal(n_points)
        section_scores = np.clip(np.round(intercept + thetas * slope), 60, 90)

        sim_mean = np.mean(section_scores)
        sim_sd = np.std(section_scores)

        # We want sim_mean ≈ target_section_mean and sim_sd ≈ target_section_sd
        err_mean = (sim_mean - target_section_mean)**2
        err_sd = (sim_sd - target_section_sd)**2
        return err_mean + err_sd * 4  # Weight SD more

    result = optimize.minimize(
        objective,
        x0=[target_section_mean, target_section_sd * 1.2],
        method='Nelder-Mead',
        options={'maxiter': 5000, 'xatol': 0.01, 'fatol': 0.001}
    )

    intercept_cal, slope_cal = result.x
    print(f"\nOptimized mapping parameters:")
    print(f"  intercept = {intercept_cal:.2f}")
    print(f"  slope     = {slope_cal:.2f}")

    # Verify
    rng_v = np.random.default_rng(456)
    thetas_v = rng_v.standard_normal(100000)
    scores_v = np.clip(np.round(intercept_cal + thetas_v * slope_cal), 60, 90)
    print(f"\nVerification (100K draws):")
    print(f"  Section score: mean={np.mean(scores_v):.2f}, SD={np.std(scores_v):.2f}")
    print(f"  Target:        mean={target_section_mean:.2f}, SD={target_section_sd:.2f}")

    # Compute total scores for verification
    # Draw 3 correlated section scores
    corr = np.array([[1.0, 0.5, 0.6], [0.5, 1.0, 0.5], [0.6, 0.5, 1.0]])
    thetas_3 = rng_v.multivariate_normal([0, 0, 0], corr, 100000)
    s_qr = np.clip(np.round(intercept_cal + thetas_3[:, 0] * slope_cal), 60, 90)
    s_vr = np.clip(np.round(intercept_cal + thetas_3[:, 1] * slope_cal), 60, 90)
    s_di = np.clip(np.round(intercept_cal + thetas_3[:, 2] * slope_cal), 60, 90)
    raw_total = (s_qr + s_vr + s_di - 180) * (20/3) + 205
    rounded = np.round(raw_total / 10).astype(int) * 10
    totals = np.where(rounded % 10 == 0, rounded + 5, rounded)
    totals = np.clip(totals, 205, 805)

    print(f"\n  Total score:   mean={np.mean(totals):.2f}, SD={np.std(totals):.2f}")
    print(f"  Official:      mean={OFFICIAL_MEAN}, SD={OFFICIAL_SD}")
    print(f"  Delta:         d_mean={np.mean(totals)-OFFICIAL_MEAN:+.2f}, d_SD={np.std(totals)-OFFICIAL_SD:+.2f}")

    return intercept_cal, slope_cal


# ============================================================================
# PHASE 2: FULL SIMULATION WITH CALIBRATED PARAMETERS
# ============================================================================

def run_calibrated_simulation(intercept, slope, n_examinees=10000, seed=42):
    """Run full CAT simulation with calibrated theta→score mapping."""
    rng = np.random.default_rng(seed)

    print(f"\n{'='*70}")
    print(f"PHASE 2: MONTE CARLO SIMULATION (calibrated)")
    print(f"{'='*70}")
    print(f"Examinees: {n_examinees:,}, Seed: {seed}")
    print(f"Mapping: score = clamp(round({intercept:.2f} + theta * {slope:.2f}), 60, 90)")
    print()

    # Draw true abilities
    corr = np.array([[1.0, 0.5, 0.6], [0.5, 1.0, 0.5], [0.6, 0.5, 1.0]])
    true_thetas = rng.multivariate_normal([0, 0, 0], corr, n_examinees)

    # Item banks
    qr_a, qr_b, qr_c = generate_bank(150, 'QR', rng)
    vr_a, vr_b, vr_c = generate_bank(150, 'VR', rng)
    di_a, di_b, di_c = generate_bank(150, 'DI', rng)

    est_theta = np.zeros((n_examinees, 3))
    se = np.zeros((n_examinees, 3))
    n_correct = np.zeros((n_examinees, 3), dtype=int)

    banks = [(qr_a, qr_b, qr_c), (vr_a, vr_b, vr_c), (di_a, di_b, di_c)]
    n_qs = [21, 23, 20]

    t0 = time.time()
    step = max(1, n_examinees // 10)

    for i in range(n_examinees):
        if (i + 1) % step == 0:
            el = time.time() - t0
            rate = (i + 1) / el
            rem = (n_examinees - i - 1) / rate
            print(f"  [{i+1:>6,}/{n_examinees:,}] {100*(i+1)/n_examinees:5.1f}% | {el:.0f}s | ~{rem:.0f}s left")

        init_theta = 0.0
        for j in range(3):
            a, b, c = banks[j]
            est_theta[i, j], se[i, j], n_correct[i, j] = simulate_cat(
                true_thetas[i, j], n_qs[j], a, b, c, rng, init_theta
            )
            init_theta = est_theta[i, j] * WARM_START

    el = time.time() - t0
    print(f"\nDone in {el:.1f}s ({n_examinees/el:.0f}/sec)")

    # Score with calibrated mapping
    section_scores = np.zeros((n_examinees, 3), dtype=int)
    for j in range(3):
        raw = intercept + est_theta[:, j] * slope
        section_scores[:, j] = np.clip(np.round(raw), 60, 90).astype(int)

    raw_total = (section_scores[:, 0] + section_scores[:, 1] + section_scores[:, 2] - 180) * (20/3) + 205
    rounded = np.round(raw_total / 10).astype(int) * 10
    total_scores = np.where(rounded % 10 == 0, rounded + 5, rounded)
    total_scores = np.clip(total_scores, 205, 805)

    return {
        'true_theta': true_thetas,
        'est_theta': est_theta,
        'se': se,
        'n_correct': n_correct,
        'section_scores': section_scores,
        'total_scores': total_scores,
    }


# ============================================================================
# PHASE 3: ANALYSIS & PLOTTING
# ============================================================================

def compute_sim_pct(total_scores):
    result = {}
    for score in OFFICIAL_PERCENTILE_TABLE:
        result[score] = round(100.0 * np.mean(total_scores < score))
    return result


def analyze(results, intercept, slope, output_dir):
    ts = results['total_scores']
    ss = results['section_scores']
    tt = results['true_theta']
    et = results['est_theta']

    sim_mean = np.mean(ts)
    sim_sd = np.std(ts)

    print(f"\n{'='*70}")
    print(f"PHASE 3: RESULTS & VALIDATION")
    print(f"{'='*70}")
    print(f"{'Metric':<35} {'Simulated':>12} {'Official':>12} {'Delta':>10}")
    print(f"{'-'*70}")
    print(f"{'Mean Total Score':<35} {sim_mean:>12.2f} {OFFICIAL_MEAN:>12.2f} {sim_mean - OFFICIAL_MEAN:>+10.2f}")
    print(f"{'Std Deviation':<35} {sim_sd:>12.2f} {OFFICIAL_SD:>12.2f} {sim_sd - OFFICIAL_SD:>+10.2f}")
    print(f"{'Median':<35} {np.median(ts):>12.1f}")
    print(f"{'Min / Max':<35} {np.min(ts):>5.0f} / {np.max(ts):>5.0f}")
    print()

    for j, name in enumerate(['QR', 'VR', 'DI']):
        s = ss[:, j]
        corr = np.corrcoef(tt[:, j], et[:, j])[0, 1]
        print(f"  {name}: score mean={np.mean(s):.1f}, sd={np.std(s):.1f}, "
              f"theta r={corr:.3f}")

    # Percentile comparison
    sim_pct = compute_sim_pct(ts)

    print(f"\n{'='*70}")
    print(f"PERCENTILE COMPARISON")
    print(f"{'='*70}")
    print(f"{'Score':<8} {'Official':>10} {'Simulated':>10} {'Delta':>8}")
    print(f"{'-'*38}")

    abs_errs = []
    n_within_2 = 0
    n_within_5 = 0
    n_pts = 0

    for score in sorted(OFFICIAL_PERCENTILE_TABLE.keys(), reverse=True):
        off = OFFICIAL_PERCENTILE_TABLE[score]
        sim = sim_pct.get(score, 0)
        d = sim - off
        abs_errs.append(abs(d))
        n_pts += 1
        if abs(d) <= 2:
            n_within_2 += 1
        elif abs(d) <= 5:
            n_within_5 += 1

        if score % 20 == 5:
            print(f"{score:<8} {off:>9}% {sim:>9}% {d:>+7}%")

    mae = np.mean(abs_errs)
    print(f"\nMAE: {mae:.2f}%")
    print(f"Within ±2%: {n_within_2}/{n_pts} ({100*n_within_2/n_pts:.1f}%)")
    print(f"Within ±5%: {n_within_2+n_within_5}/{n_pts} ({100*(n_within_2+n_within_5)/n_pts:.1f}%)")

    ks_stat, ks_pval = stats.kstest(ts, 'norm', args=(OFFICIAL_MEAN, OFFICIAL_SD))
    print(f"\nKS test: D={ks_stat:.4f}, p={ks_pval:.2e}")

    # =====================================================================
    # FIGURE 1: Distribution Comparison (2x2)
    # =====================================================================
    print("\nGenerating plots...")

    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle(f'GMAT Scoring Algorithm — Calibrated Validation\n'
                 f'(intercept={intercept:.2f}, slope={slope:.2f})',
                 fontsize=15, fontweight='bold', y=0.99)

    # A: Histogram with KDE overlay
    # Use wider bins (30pt) to smooth the "bouncy" artifact caused by
    # the discrete section-score-to-total-score mapping (20/3 factor
    # creates non-uniform reachability across the 10-point score grid).
    ax = axes[0, 0]
    bins_wide = np.arange(190, 821, 30)
    ax.hist(ts, bins=bins_wide, density=True, alpha=0.35, color='#2196F3', edgecolor='white',
            label='Simulated (hist)')
    # KDE overlay for the smooth underlying distribution
    from scipy.stats import gaussian_kde
    kde = gaussian_kde(ts, bw_method=0.15)
    x = np.linspace(205, 805, 300)
    ax.plot(x, kde(x), '-', color='#1565C0', lw=2.5, label='Simulated (KDE)')
    ax.plot(x, stats.norm.pdf(x, OFFICIAL_MEAN, OFFICIAL_SD), 'r-', lw=2.5,
            label=f'Official N({OFFICIAL_MEAN:.0f}, {OFFICIAL_SD:.0f}$^2$)')
    ax.set_xlabel('Total Score')
    ax.set_ylabel('Density')
    ax.set_title('A. Total Score Distribution', fontweight='bold')
    ax.legend(fontsize=9)
    ax.set_xlim(200, 810)
    ax.text(0.02, 0.97,
            f'Sim: $\\mu$={sim_mean:.1f}, $\\sigma$={sim_sd:.1f}\n'
            f'Off: $\\mu$={OFFICIAL_MEAN}, $\\sigma$={OFFICIAL_SD}\n'
            f'$\\Delta\\mu$={sim_mean-OFFICIAL_MEAN:+.1f}, $\\Delta\\sigma$={sim_sd-OFFICIAL_SD:+.1f}',
            transform=ax.transAxes, fontsize=9, va='top',
            bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

    # B: Percentile curves
    ax = axes[0, 1]
    off_scores = sorted(OFFICIAL_PERCENTILE_TABLE.keys())
    off_pcts = [OFFICIAL_PERCENTILE_TABLE[s] for s in off_scores]
    sim_pcts = [sim_pct.get(s, 0) for s in off_scores]
    ax.plot(off_scores, off_pcts, 'ro-', ms=3, lw=1.5, label='Official', alpha=0.8)
    ax.plot(off_scores, sim_pcts, 'b^-', ms=3, lw=1.5, label='Simulated', alpha=0.8)
    ax.set_xlabel('Total Score')
    ax.set_ylabel('Percentile (%)')
    ax.set_title('B. Percentile Curves', fontweight='bold')
    ax.legend()
    ax.set_xlim(200, 810)
    ax.set_ylim(-2, 102)
    ax.grid(True, alpha=0.3)

    # C: Percentile error
    ax = axes[1, 0]
    errs = [sim_pcts[i] - off_pcts[i] for i in range(len(off_scores))]
    colors = ['#F44336' if abs(e) > 5 else '#FF9800' if abs(e) > 2 else '#4CAF50' for e in errs]
    ax.bar(off_scores, errs, width=8, color=colors, alpha=0.8)
    ax.axhline(0, color='black', lw=0.8)
    ax.axhline(5, color='red', lw=0.5, ls='--', alpha=0.5)
    ax.axhline(-5, color='red', lw=0.5, ls='--', alpha=0.5)
    ax.set_xlabel('Total Score')
    ax.set_ylabel('Percentile Error')
    ax.set_title('C. Percentile Deviation', fontweight='bold')
    ax.set_xlim(200, 810)
    ax.text(0.02, 0.97, f'MAE: {mae:.1f}%\nMax: {max(errs, key=abs):+.0f}%',
            transform=ax.transAxes, fontsize=10, va='top',
            bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8))

    # D: Section scores with KDE overlay
    ax = axes[1, 1]
    section_bins = np.arange(58.5, 92.5, 2)  # wider bins (2pt) for cleaner look
    sec_x = np.linspace(59, 91, 200)
    for j, (name, color, dark) in enumerate([('QR', '#F44336', '#B71C1C'), ('VR', '#2196F3', '#0D47A1'), ('DI', '#4CAF50', '#1B5E20')]):
        ax.hist(ss[:, j], bins=section_bins, density=True, alpha=0.25, color=color,
                edgecolor='white')
        sec_kde = gaussian_kde(ss[:, j], bw_method=0.3)
        ax.plot(sec_x, sec_kde(sec_x), '-', color=dark, lw=2,
                label=f"{name} ($\\mu$={np.mean(ss[:, j]):.1f})")
    ax.set_xlabel('Section Score')
    ax.set_ylabel('Density')
    ax.set_title('D. Section Score Distributions', fontweight='bold')
    ax.legend()
    ax.set_xlim(58, 92)

    plt.tight_layout(rect=[0, 0, 1, 0.95])
    fig.savefig(f'{output_dir}/calibrated_distribution.png', dpi=150, bbox_inches='tight')
    print(f"  Saved: calibrated_distribution.png")

    # =====================================================================
    # FIGURE 2: Theta & CAT accuracy
    # =====================================================================
    fig, axes = plt.subplots(2, 3, figsize=(18, 10))
    fig.suptitle('CAT Theta Estimation (Calibrated)', fontsize=15, fontweight='bold', y=0.98)

    sec_names = ['QR', 'VR', 'DI']
    sec_colors = ['#F44336', '#2196F3', '#4CAF50']
    n_qs = [21, 23, 20]
    rng_p = np.random.default_rng(0)

    for j, (name, color) in enumerate(zip(sec_names, sec_colors)):
        ax = axes[0, j]
        n_p = min(3000, len(tt))
        idx = rng_p.choice(len(tt), n_p, replace=False)
        corr = np.corrcoef(tt[:, j], et[:, j])[0, 1]
        ax.scatter(tt[idx, j], et[idx, j], alpha=0.15, s=8, color=color)
        ax.plot([-3.5, 3.5], [-3.5, 3.5], 'k--', lw=1)
        sl, ic = np.polyfit(tt[:, j], et[:, j], 1)
        xl = np.linspace(-3, 3, 100)
        ax.plot(xl, sl * xl + ic, color='orange', lw=2, label=f'y={sl:.2f}x{ic:+.2f}')
        ax.set_xlabel('True θ')
        ax.set_ylabel('Estimated θ')
        ax.set_title(f'{name}: r={corr:.3f}', fontweight='bold')
        ax.legend(fontsize=9)
        ax.set_xlim(-3.5, 3.5)
        ax.set_ylim(-3.5, 3.5)
        ax.set_aspect('equal')
        ax.grid(True, alpha=0.2)

        ax = axes[1, j]
        nc = results['n_correct'][:, j]
        hb = ax.hexbin(nc, ss[:, j], gridsize=15, cmap='YlOrRd', mincnt=1)
        plt.colorbar(hb, ax=ax, label='Count')
        ax.set_xlabel(f'Correct (of {n_qs[j]})')
        ax.set_ylabel('Section Score')
        ax.set_title(f'{name}: Correct → Score', fontweight='bold')
        ax.set_ylim(58, 92)

    plt.tight_layout(rect=[0, 0, 1, 0.96])
    fig.savefig(f'{output_dir}/calibrated_theta.png', dpi=150, bbox_inches='tight')
    print(f"  Saved: calibrated_theta.png")

    # =====================================================================
    # FIGURE 3: Q-Q, CDF, Score bands
    # =====================================================================
    fig, axes = plt.subplots(1, 3, figsize=(18, 6))
    fig.suptitle('Distribution Fit Analysis (Calibrated)', fontsize=15, fontweight='bold', y=1.02)

    # Q-Q
    ax = axes[0]
    n = len(ts)
    sorted_s = np.sort(ts)
    theoretical = stats.norm.ppf(np.arange(1, n+1)/(n+1), OFFICIAL_MEAN, OFFICIAL_SD)
    step = max(1, n // 2000)
    ax.scatter(theoretical[::step], sorted_s[::step], alpha=0.3, s=8, color='#2196F3')
    ax.plot([200, 810], [200, 810], 'r--', lw=1.5, label='Perfect fit')
    ax.set_xlabel(f'Theoretical N({OFFICIAL_MEAN:.0f}, {OFFICIAL_SD:.0f}²)')
    ax.set_ylabel('Simulated')
    ax.set_title('A. Q-Q Plot', fontweight='bold')
    ax.legend()
    ax.set_xlim(200, 810)
    ax.set_ylim(200, 810)
    ax.set_aspect('equal')
    ax.grid(True, alpha=0.2)

    # CDF
    ax = axes[1]
    ax.plot(sorted_s, np.arange(1, n+1)/n*100, 'b-', lw=2, label='Simulated', alpha=0.8)
    ax.plot(off_scores, off_pcts, 'ro-', ms=3, lw=1.5, label='Official', alpha=0.8)
    xr = np.linspace(205, 805, 300)
    ax.plot(xr, stats.norm.cdf(xr, OFFICIAL_MEAN, OFFICIAL_SD)*100, 'g--', lw=1.5, alpha=0.7)
    ax.set_xlabel('Total Score')
    ax.set_ylabel('Cumulative %')
    ax.set_title('B. CDF', fontweight='bold')
    ax.legend(fontsize=9)
    ax.set_xlim(200, 810)
    ax.grid(True, alpha=0.3)

    # Bands
    ax = axes[2]
    bands = [
        ('Below Avg\n(205-504)', 205, 504),
        ('Average\n(505-604)', 505, 604),
        ('Above Avg\n(605-664)', 605, 664),
        ('Competitive\n(665-714)', 665, 714),
        ('Top Schools\n(715+)', 715, 805),
    ]
    bpcts = [100*np.mean((ts >= lo) & (ts <= hi)) for _, lo, hi in bands]
    bcolors = ['#F44336', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50']
    bars = ax.barh(range(len(bands)), bpcts, color=bcolors, edgecolor='white', height=0.7, alpha=0.85)
    ax.set_yticks(range(len(bands)))
    ax.set_yticklabels([b[0] for b in bands])
    ax.set_xlabel('% of Test-Takers')
    ax.set_title('C. Score Bands', fontweight='bold')
    for bar, pct in zip(bars, bpcts):
        ax.text(bar.get_width()+0.5, bar.get_y()+bar.get_height()/2,
                f'{pct:.1f}%', va='center', fontsize=11, fontweight='bold')
    ax.set_xlim(0, max(bpcts)*1.3)

    plt.tight_layout()
    fig.savefig(f'{output_dir}/calibrated_fit.png', dpi=150, bbox_inches='tight')
    print(f"  Saved: calibrated_fit.png")

    # =====================================================================
    # FIGURE 4: Percentile table
    # =====================================================================
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.axis('off')

    key_scores = list(range(805, 195, -20))
    tdata = []
    for score in key_scores:
        off = OFFICIAL_PERCENTILE_TABLE.get(score, '—')
        sim = sim_pct.get(score, '—')
        if isinstance(off, (int, float)) and isinstance(sim, (int, float)):
            d = sim - off
            ds = f'{d:+d}'
        else:
            ds = '—'
        tdata.append([str(score), str(off), str(sim), ds])

    tbl = ax.table(cellText=tdata,
                   colLabels=['Score', 'Official %ile', 'Simulated %ile', 'Delta'],
                   cellLoc='center', loc='center')
    tbl.auto_set_font_size(False)
    tbl.set_fontsize(11)
    tbl.scale(1, 1.5)
    for i in range(len(tdata)):
        cell = tbl[i+1, 3]
        try:
            dv = int(tdata[i][3])
            if abs(dv) <= 2: cell.set_facecolor('#C8E6C9')
            elif abs(dv) <= 5: cell.set_facecolor('#FFE0B2')
            else: cell.set_facecolor('#FFCDD2')
        except ValueError:
            pass
    for j in range(4):
        tbl[0, j].set_facecolor('#37474F')
        tbl[0, j].set_text_props(color='white', fontweight='bold')

    ax.set_title('Calibrated Percentile Comparison\n(Green: ≤2%, Orange: ≤5%, Red: >5%)',
                 fontsize=14, fontweight='bold', pad=20)
    fig.savefig(f'{output_dir}/calibrated_percentile_table.png', dpi=150, bbox_inches='tight')
    print(f"  Saved: calibrated_percentile_table.png")

    plt.close('all')

    # Print recommended parameters for gmatScoringAlgorithm.ts
    print(f"\n{'='*70}")
    print(f"RECOMMENDED PARAMETERS FOR gmatScoringAlgorithm.ts")
    print(f"{'='*70}")
    print(f"const THETA_TO_SCORE = {{")
    print(f"  intercept: {intercept:.1f},")
    print(f"  slope: {slope:.1f},")
    print(f"  min: 60,")
    print(f"  max: 90,")
    print(f"}};")
    print()
    print(f"This produces:")
    print(f"  theta=-1.5 -> score = max(60, round({intercept:.1f} + (-1.5)*{slope:.1f})) = max(60, {intercept + (-1.5)*slope:.0f}) -> {max(60, round(intercept + (-1.5)*slope))}")
    print(f"  theta= 0.0 -> score = round({intercept:.1f}) -> {round(intercept)}")
    print(f"  theta=+1.5 -> score = min(90, round({intercept:.1f} + 1.5*{slope:.1f})) = min(90, {intercept + 1.5*slope:.0f}) -> {min(90, round(intercept + 1.5*slope))}")

    return sim_pct


# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    import os

    output_dir = os.path.dirname(os.path.abspath(__file__))
    t_start = time.time()

    # Phase 1: Calibrate
    intercept, slope = calibrate_mapping()

    # Phase 2: Simulate with calibrated parameters
    results = run_calibrated_simulation(intercept, slope, n_examinees=10000, seed=42)

    # Phase 3: Analyze and plot
    analyze(results, intercept, slope, output_dir)

    print(f"\nTotal time: {time.time() - t_start:.1f}s")
