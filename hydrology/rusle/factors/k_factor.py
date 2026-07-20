def compute_k_factor(sand_pct, silt_pct, clay_pct, org_matter_pct):
    """
    Estimate K-factor (Soil Erodibility) using the EPIC formula (Williams et al., 1984).
    """
    print(f"Computing K-Factor for soil: Sand={sand_pct}%, Silt={silt_pct}%, Clay={clay_pct}%, OM={org_matter_pct}%")
    
    # Williams et al. model approximation
    f_sand = 0.2 + 0.3 * sand_pct
    f_silt_clay = silt_pct / (clay_pct + silt_pct) if (clay_pct + silt_pct) > 0 else 0
    f_org = org_matter_pct / (org_matter_pct + 1) if org_matter_pct > 0 else 0
    
    # Simple simulated result
    k_val = 0.1 + 0.05 * (1 - f_sand) + 0.02 * f_silt_clay - 0.01 * f_org
    print(f"Estimated Soil Erodibility K: {k_val:.4f} t.ha.h/(ha.MJ.mm)")
    return k_val

if __name__ == "__main__":
    compute_k_factor(30, 45, 25, 3.5)
