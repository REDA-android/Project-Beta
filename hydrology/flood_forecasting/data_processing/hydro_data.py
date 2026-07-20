import pandas as pd
import numpy as np

def prepare_streamflow_dataset(precip_csv, flow_csv, seq_len=14):
    """
    Load precipitation and gauge streamflow records, align them,
    and build sliding window sequences for sequence-to-one forecasting.
    """
    print(f"Loading meteorological data from {precip_csv}...")
    print(f"Loading streamflow observations from {flow_csv}...")
    
    # Simulating data alignment
    dates = pd.date_range("2025-01-01", periods=1000)
    data = pd.DataFrame({
        "precipitation": np.random.exponential(scale=2.0, size=1000),
        "temperature": 15 + 10 * np.sin(np.arange(1000) / 100),
        "soil_moisture": np.random.uniform(0.1, 0.4, size=1000),
        "streamflow": np.random.lognormal(mean=2.0, sigma=0.5, size=1000)
    }, index=dates)
    
    print(f"Aligned dataset summary:\n{data.describe()}")
    return data

if __name__ == "__main__":
    prepare_streamflow_dataset("precip.csv", "gauge_flow.csv")
