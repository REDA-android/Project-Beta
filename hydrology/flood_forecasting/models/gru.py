import torch
import torch.nn as nn

class FloodGRU(nn.Module):
    """
    Gated Recurrent Unit (GRU) model for hydrology forecasting.
    Computationally efficient alternative to LSTMs.
    """
    def __init__(self, input_size=5, hidden_size=64, num_layers=2, output_size=1):
        super(FloodGRU, self).__init__()
        self.gru = nn.GRU(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        out, _ = self.gru(x)
        out = self.fc(out[:, -1, :])
        return out

if __name__ == "__main__":
    model = FloodGRU()
    print("Initializing FloodGRU...")
    print(model)
