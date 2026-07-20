def compute_ls_factor(slope_deg, flow_accumulation_m):
    """
    Calculate LS-factor (Slope Length & Steepness) using Moore and Burch (1986) formula.
    LS = (As / 22.13)^0.4 * (sin(theta)/0.0896)^1.3
    As: Flow Accumulation
    theta: Slope Angle in radians
    """
    import math
    print("Computing LS-Factor from DEM terrain attributes...")
    theta = math.radians(slope_deg)
    ls_val = ((flow_accumulation_m / 22.13) ** 0.4) * ((math.sin(theta) / 0.0896) ** 1.3)
    print(f"Slope: {slope_deg}° | Flow Accumulation: {flow_accumulation_m}m | Estimated LS: {ls_val:.4f}")
    return ls_val

if __name__ == "__main__":
    compute_ls_factor(8.5, 120.0)
