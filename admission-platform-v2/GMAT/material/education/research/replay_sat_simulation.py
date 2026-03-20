"""
Replay sat@mail.com simulation with calibrated IRT parameters.

Old b-parameter mapping: hard = +0.8  (buggy)
New b-parameter mapping: hard = +1.5  (calibrated, piecewise asymmetric)

Old discrimination default: a = 1.0
New discrimination default: a = 1.2  (Kingston et al. 1985)

Scoring: intercept=77.5, slope=5.7 (from SIMULATION-VALIDATION-REPORT.md)
"""

import numpy as np

# ============================================================================
# IRT functions (identical to adaptiveAlgorithm.ts logic)
# ============================================================================

def icc_3pl(theta, a, b, c):
    exponent = np.clip(-a * (theta - b), -40, 40)
    return c + (1 - c) / (1 + np.exp(exponent))

def mle_theta(responses, b_vals, a=1.2, c=0.17, theta_init=0.0):
    """Newton-Raphson MLE theta estimation (30 iterations max)."""
    r = np.array(responses, dtype=float)
    a_arr = np.full(len(r), a)
    b_arr = np.array(b_vals)
    c_arr = np.full(len(r), c)
    theta = theta_init
    for _ in range(30):
        p = np.clip(icc_3pl(theta, a_arr, b_arr, c_arr), 1e-10, 1 - 1e-10)
        q = 1 - p
        w = a_arr * (p - c_arr) / (1 - c_arr)
        L1 = np.sum(w * (r - p) / (p * q))
        L2 = np.sum(-(w**2) / (p * q))
        if abs(L2) < 1e-10:
            break
        delta = L1 / L2
        theta = np.clip(theta - delta, -4.0, 4.0)
        if abs(delta) < 0.001:
            break
    return float(theta)

def eap_theta(responses, b_vals, a=1.2, c=0.17, prior_mean=0.0):
    """Expected A Posteriori (EAP) for first 2 items."""
    quad = np.linspace(-4, 4, 41)
    r = np.array(responses, dtype=float)
    log_lik = np.zeros(len(quad))
    for j in range(len(r)):
        p = np.clip(icc_3pl(quad, a, b_vals[j], c), 1e-10, 1 - 1e-10)
        log_lik += np.where(r[j] == 1, np.log(p), np.log(1 - p))
    prior = np.log(1.0 / np.sqrt(2 * np.pi) * np.exp(-0.5 * ((quad - prior_mean)**2)) + 1e-30)
    log_post = log_lik + prior
    log_post -= np.max(log_post)
    post = np.exp(log_post)
    post /= np.sum(post)
    return float(np.sum(quad * post))


# ============================================================================
# b-parameter mappings (difficulty string -> IRT b)
# ============================================================================

def difficulty_to_b_OLD(difficulty_label):
    """Old (buggy) mapping: hard -> +0.8"""
    d = {'easy': 1, 'medium': 3, 'hard': 5}.get(difficulty_label.lower(), 3)
    return (d - 3) * 0.8  # easy=-1.6, medium=0, hard=+1.6 ... but used 1-5 scale

def difficulty_to_b_NEW(difficulty_label):
    """New calibrated piecewise mapping: hard -> +1.5"""
    mapping = {'easy': -1.0, 'medium': 0.0, 'hard': 1.5}
    return mapping.get(difficulty_label.lower(), 0.0)


# ============================================================================
# Actual response data from sat_mail_com.json
# ============================================================================

# QR section: questions 1-21 (sorted by question_order)
QR_DATA = [
    # (question_order, difficulty, is_correct)
    (1,  'medium', True),
    (2,  'hard',   True),
    (3,  'hard',   True),
    (4,  'hard',   True),
    (5,  'hard',   True),
    (6,  'hard',   True),
    (7,  'hard',   True),
    (8,  'hard',   True),
    (9,  'hard',   True),
    (10, 'hard',   True),
    (11, 'hard',   True),
    (12, 'hard',   True),
    (13, 'hard',   True),
    (14, 'hard',   True),
    (15, 'hard',   True),
    (16, 'hard',   False),
    (17, 'hard',   False),
    (18, 'hard',   False),
    (19, 'hard',   True),
    (20, 'hard',   False),
    (21, 'hard',   False),
]

# DI section: questions 22-41
DI_DATA = [
    (22, 'medium', True),
    (23, 'hard',   True),
    (24, 'hard',   True),
    (25, 'hard',   True),
    (26, 'hard',   True),
    (27, 'hard',   True),
    (28, 'hard',   True),
    (29, 'hard',   True),
    (30, 'hard',   True),
    (31, 'hard',   True),
    (32, 'hard',   True),
    (33, 'hard',   True),
    (34, 'hard',   True),
    (35, 'hard',   False),
    (36, 'hard',   False),
    (37, 'hard',   False),
    (38, 'hard',   False),
    (39, 'hard',   True),
    (40, 'hard',   False),
    (41, 'hard',   False),
]

# VR section: questions 42-64
VR_DATA = [
    (42, 'medium', True),
    (43, 'hard',   True),
    (44, 'hard',   True),
    (45, 'hard',   True),
    (46, 'hard',   True),
    (47, 'hard',   True),
    (48, 'hard',   True),
    (49, 'hard',   True),
    (50, 'hard',   True),
    (51, 'hard',   True),
    (52, 'hard',   True),
    (53, 'hard',   True),
    (54, 'hard',   True),
    (55, 'hard',   True),
    (56, 'hard',   True),
    (57, 'hard',   False),
    (58, 'hard',   False),
    (59, 'hard',   False),
    (60, 'hard',   False),
    (61, 'hard',   True),
    (62, 'hard',   False),
    (63, 'hard',   False),
    (64, 'hard',   False),
]


# ============================================================================
# Replay function: run MLE/EAP theta estimation on actual response sequence
# ============================================================================

def replay_section(section_data, b_fn, a=1.2, c=0.17, init_theta=0.0, label=''):
    """
    Replay the exact response sequence using the given b-parameter mapping.
    Returns (final_theta, theta_trajectory, b_values, responses)
    """
    responses = []
    b_values = []
    theta = init_theta
    trajectory = [init_theta]

    for i, (q_order, difficulty, is_correct) in enumerate(section_data):
        b = b_fn(difficulty)
        b_values.append(b)
        responses.append(1 if is_correct else 0)

        if i < 2:
            theta = eap_theta(responses, b_values, a=a, c=c, prior_mean=init_theta)
        else:
            theta = mle_theta(responses, b_values, a=a, c=c, theta_init=theta)

        trajectory.append(theta)

    return theta, trajectory, b_values, responses


# ============================================================================
# Scoring
# ============================================================================

INTERCEPT = 77.5
SLOPE = 5.7
WARM_START = 0.3

def theta_to_section_score(theta):
    raw = INTERCEPT + theta * SLOPE
    return int(np.clip(round(raw), 60, 90))

def compute_total_score(s_qr, s_vr, s_di):
    raw = (s_qr + s_vr + s_di - 180) * (20 / 3) + 205
    rounded = round(raw / 10) * 10
    total = rounded + 5 if rounded % 10 == 0 else rounded
    return int(np.clip(total, 205, 805))


# ============================================================================
# Run comparison: OLD vs NEW parameters
# ============================================================================

def run_comparison():
    print("=" * 70)
    print("sat@mail.com SIMULATION REPLAY")
    print("Old parameters vs. calibrated parameters")
    print("=" * 70)

    for label, b_fn, a_val, c_val in [
        ("OLD (a=1.0, hard->b=+0.8)",  difficulty_to_b_OLD, 1.0, 0.17),
        ("NEW (a=1.2, hard->b=+1.5)",  difficulty_to_b_NEW, 1.2, 0.17),
    ]:
        print(f"\n{'-'*70}")
        print(f"  Parameters: {label}")
        print(f"{'-'*70}")

        # QR
        theta_qr, traj_qr, _, resp_qr = replay_section(
            QR_DATA, b_fn, a=a_val, c=c_val, init_theta=0.0, label='QR')

        # DI — warm start from QR
        init_di = theta_qr * WARM_START
        theta_di, traj_di, _, resp_di = replay_section(
            DI_DATA, b_fn, a=a_val, c=c_val, init_theta=init_di, label='DI')

        # VR — warm start from DI
        init_vr = theta_di * WARM_START
        theta_vr, traj_vr, _, resp_vr = replay_section(
            VR_DATA, b_fn, a=a_val, c=c_val, init_theta=init_vr, label='VR')

        s_qr = theta_to_section_score(theta_qr)
        s_di = theta_to_section_score(theta_di)
        s_vr = theta_to_section_score(theta_vr)
        total = compute_total_score(s_qr, s_vr, s_di)

        n_correct_qr = sum(resp_qr)
        n_correct_di = sum(resp_di)
        n_correct_vr = sum(resp_vr)

        print(f"\n  Section Results:")
        print(f"  {'Section':<12} {'Correct/Total':<16} {'theta final':<12} {'Score'}")
        print(f"  {'-'*54}")
        print(f"  {'QR':<12} {n_correct_qr}/{len(resp_qr):<12}    {theta_qr:>+7.3f}      {s_qr}")
        print(f"  {'DI':<12} {n_correct_di}/{len(resp_di):<12}    {theta_di:>+7.3f}      {s_di}")
        print(f"  {'VR':<12} {n_correct_vr}/{len(resp_vr):<12}    {theta_vr:>+7.3f}      {s_vr}")
        print(f"\n  -> Total Score: {total}")

        # Show theta trajectory for QR to illustrate escalation behavior
        print(f"\n  QR theta trajectory (every 3 questions):")
        for i in range(0, len(traj_qr), 3):
            diff = QR_DATA[i][1] if i < len(QR_DATA) else '—'
            correct = QR_DATA[i][2] if i < len(QR_DATA) else '—'
            marker = 'Y' if correct is True else ('N' if correct is False else ' ')
            print(f"    Q{i+1:>2} {marker} ({diff:6}) -> theta = {traj_qr[i]:+.3f}")
        print(f"    Final         -> theta = {traj_qr[-1]:+.3f}")


if __name__ == '__main__':
    run_comparison()
