import numpy as np

def calculate_nse(observed: np.ndarray, simulated: np.ndarray) -> float:
    """
    Calculate the Nash-Sutcliffe Efficiency (NSE).
    NSE = 1 - sum((obs - sim)^2) / sum((obs - mean_obs)^2)
    """
    numerator = np.sum((observed - simulated) ** 2)
    denominator = np.sum((observed - np.mean(observed)) ** 2)
    return float(1.0 - (numerator / denominator))

def calculate_kge(observed: np.ndarray, simulated: np.ndarray) -> float:
    """
    Calculate the Kling-Gupta Efficiency (KGE).
    KGE = 1 - sqrt((r - 1)^2 + (beta - 1)^2 + (gamma - 1)^2)
    """
    cc = np.corrcoef(observed, simulated)[0, 1]
    beta = np.mean(simulated) / np.mean(observed)
    gamma = (np.std(simulated) / np.mean(simulated)) / (np.std(observed) / np.mean(observed))
    
    kge = 1.0 - np.sqrt((cc - 1)**2 + (beta - 1)**2 + (gamma - 1)**2)
    return float(kge)

if __name__ == "__main__":
    obs = np.array([12.5, 14.2, 18.1, 24.5, 31.0, 22.1, 17.5, 15.0, 13.8, 12.9])
    sim = np.array([11.8, 13.9, 19.5, 26.0, 29.8, 21.0, 16.9, 14.2, 13.5, 12.4])
    
    nse = calculate_nse(obs, sim)
    kge = calculate_kge(obs, sim)
    
    print("====== Hydrological Performance Metrics ======")
    print(f"Nash-Sutcliffe Efficiency (NSE): {nse:.4f} (Ideal: 1.0)")
    print(f"Kling-Gupta Efficiency (KGE):    {kge:.4f} (Ideal: 1.0)")
    print("==============================================")
