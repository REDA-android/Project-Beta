def compute_r_factor(annual_precipitation_mm):
    """
    Estimate R-factor (Rainfall Erosivity in MJ mm / ha h yr)
    based on the Wischmeier and Smith (1978) or Arnoldus (1980) formulas.
    """
    print("Computing Rainfall Erosivity R-factor...")
    # R = 38.5 + 0.35 * annual_precipitation_mm
    r_val = 38.5 + 0.35 * annual_precipitation_mm
    print(f"Annual Precipitation: {annual_precipitation_mm}mm | Estimated R: {r_val:.2f} MJ.mm/ha.h.yr")
    return r_val

if __name__ == "__main__":
    compute_r_factor(1250.0)
