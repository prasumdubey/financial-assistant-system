import numpy as np
import pandas as pd
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error
from scipy.stats import randint

df=pd.read_csv("C:/Users/Prashant dubey/Desktop/data.csv")
columns_to_merge = [37, 38, 44, 45, 48, 49, 55, 66, 73, 78, 79, 83, 87, 90]
income= df.iloc[:, columns_to_merge].mean(axis=1)

columns_to_merge = [1,2,3,16,51,53,54,74,84]
assets = df.iloc[:, columns_to_merge].mean(axis=1)

columns_to_merge = [9,11,12,15,16,17,34,43,52,59,60,63,68]
expenses = df.iloc[:, columns_to_merge].mean(axis=1)

columns_to_merge = [10,14,35,36,39,89]
debts = df.iloc[:, columns_to_merge].mean(axis=1)

columns_to_merge = [40,56,58,61,62,64,65,75,76,82,88]
liabilities = df.iloc[:, columns_to_merge].mean(axis=1)

columns_to_merge = [13,31,66,72,85,92]
savings = df.iloc[:, columns_to_merge].mean(axis=1)

columns_to_merge = [4,5,6,7,8,18,19,20,21,22,23,24,25,26,27,28,29,30,41,42,50,86]
profit = df.iloc[:, columns_to_merge].mean(axis=1)

can_invest=df['Bankrupt?']
col={'income':income,'assets':assets,'expenses':expenses,'debts':debts,'liabilities':liabilities,'savings':savings,'profit':profit,'can_invest':can_invest}
data=pd.DataFrame(col)


features1=data.iloc[:,0:7]
target1=data.iloc[:,7]

X1=features1
y1=target1

X_train1, X_test1, y_train1, y_test1 = train_test_split(X1, y1, test_size=0.2, random_state=42)

scaler = StandardScaler()
X_train_scaled1 = scaler.fit_transform(X_train1)
X_test_scaled1 = scaler.transform(X_test1)

model1 = LogisticRegression()

model1.fit(X_train_scaled1, y_train1)

y_pred1 = model1.predict(X_test_scaled1)



# Assuming 'data' and 'target2' are already defined
# features2 and target2 are your features and target variables
features2 = data.iloc[:, 0:7]  # Adjust column indices as needed

# Split the data into features and target
key=df.iloc[:,29]
target2=df.iloc[:,32]*key

X2 = features2
y2 = target2

# Split the data into training and testing sets
X_train2, X_test2, y_train2, y_test2 = train_test_split(X2, y2, test_size=0.2, random_state=42)

# Standardize/Normalize the data using StandardScaler
scaler = StandardScaler()
X_train2 = scaler.fit_transform(X_train2)
X_test2 = scaler.transform(X_test2)

# Define the GradientBoostingRegressor model
gbr = GradientBoostingRegressor(random_state=42)

# Define the hyperparameter grid to search over
param_dist = {
    'n_estimators': [100, 200],             # Number of boosting stages
    'learning_rate': [0.01, 0.05, 0.1],     # Shrinks contribution of each tree
    'max_depth': randint(3, 7),             # Maximum depth of individual trees
    'min_samples_split': randint(2, 10),    # Minimum number of samples required to split
    'min_samples_leaf': randint(1, 4),      # Minimum number of samples in a leaf
    'subsample': [0.8, 1.0]                 # Fraction of samples used for fitting individual base learners
}

# Set up RandomizedSearchCV for hyperparameter tuning (using 10 iterations)
random_search = RandomizedSearchCV(estimator=gbr, param_distributions=param_dist, 
                                   n_iter=10, cv=5, scoring='neg_mean_absolute_error', 
                                   n_jobs=-1, verbose=2, random_state=42)

# Fit the model with the training data
random_search.fit(X_train2, y_train2)

# Get the best model from random search
best_model = random_search.best_estimator_

# Make predictions on the test data
y_pred2 = best_model.predict(X_test2)

pickle.dump(model1,open('train_model1.pkl','wb'))
pickle.dump(best_model,open('train_model2.pkl','wb'))

