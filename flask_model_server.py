from flask import Flask, request, jsonify
import pickle
import numpy as np
import os

app = Flask(__name__)

# Load your pre-trained model
model_path = 'train_model.pkl'
if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model file '{model_path}' not found. Make sure it's in the correct directory.")

with open(model_path, 'rb') as file:
    model = pickle.load(file)

@app.route('/predict-investment', methods=['POST'])
def predict():
    try:
        # Get JSON data from the request
        data = request.get_json()
        if not data or 'inputs' not in data:
            return jsonify({'error': 'Invalid input. JSON with "inputs" is required.'}), 400
        
        model_input = np.array([data['inputs']])
        
        # Validate input size (assuming model expects 7 features)
        if model_input.shape[1] != 7:
            return jsonify({'error': 'Input size must be 7 features.'}), 400
        
        # Predict using the loaded model
        prediction = model.predict(model_input)
        
        return jsonify({'prediction': int(prediction[0])})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
