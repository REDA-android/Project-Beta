import torch
import torch.nn as nn

class FloodLSTM(nn.Module):
    """
    LSTM-based flood forecasting model.
    Predicts future river discharge based on history of precipitation, temperature, and run-off.
    """
    def __init__(self, input_size=5, hidden_size=64, num_layers=2, output_size=1):
        super(FloodLSTM, self).__init__()
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)
        
    def forward(self, x):
        # x shape: (batch_size, sequence_length, input_size)
        out, _ = self.lstm(x)
        out = self.fc(out[:, -1, :]) # Take the last time-step
        return out

if __name__ == "__main__":
    model = FloodLSTM()
    print("Initializing FloodLSTM model configuration...")
    print(model)
