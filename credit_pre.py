import pandas as pd
from sdv.tabular import CTGAN
import zipfile

# 1. Extract your CSV from the zip
with zipfile.ZipFile("credit_risk_dataset.csv.zip", 'r') as zip_ref:
    zip_ref.extractall("data/")

# 2. Load the dataset
data = pd.read_csv("data/credit_risk_dataset.csv")
print("Original data shape:", data.shape)

# 3. Train CTGAN
model = CTGAN()
model.fit(data)

# 4. Generate synthetic data
synthetic_data = model.sample(1000)  # Change 1000 to however many rows you want
print("Synthetic data shape:", synthetic_data.shape)

# 5. Save the synthetic data
synthetic_data.to_csv("synthetic_credit_data.csv", index=False)