# Financial-Assistant-System
An intelligent platform helps you manage your finances by analyzing your income, spending patterns, and assets to provide personalized financial advice.

# Features :-
     1.Analyze income and expenses to provide optimized budgeting advice.
     2.Track your financial growth over time and visualize key insights.
     3.Receive property and investment recommendations based on your financial data.

# Tech Stack Required :-
     1. FrontEnd : HTML, CSS, JavaScript
     2. BackEnd : Node js, Express js
     3. Database : MySQL
     4. Data Analysis : Python pandas, numpy
     5. Machine Learning Model : Scikit-learn
     6. Visualisation Tools : Matplotlib
     7. Other Tools : Vs Code, Github, Docker

# Steps to Setup the application :-
     1. Setup MYSQL Database :
           -- Create Database financial_assistant
              CREATE DATABASE `financial_assistant`;

           -- Create the users table
              CREATE TABLE `users` (
              `id` int NOT NULL AUTO_INCREMENT,
              `full_name` varchar(100) DEFAULT NULL,
              `username` varchar(50) DEFAULT NULL,
              `email` varchar(100) DEFAULT NULL,
              `password` varchar(255) DEFAULT NULL,
              PRIMARY KEY (`id`),
              UNIQUE KEY `username` (`username`)
              ) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

           -- Create the financial_data table
              use financial_assistant;
              CREATE TABLE financial_data (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  user_id INT,
                  income DECIMAL(10, 2),
                  expenses DECIMAL(10, 2),
                  savings DECIMAL(10, 2),
                  investment DECIMAL(10, 2),
                  property_valueproperty_value DECIMAL(10, 2),
                  FOREIGN KEY (user_id) REFERENCES users(id) -- assuming you have a users table
              );
              
            -- Create the transactions table
              CREATE TABLE transactions (
                  id INT AUTO_INCREMENT PRIMARY KEY,
                  user_id INT,
                  amount DECIMAL(10, 2),
                  date DATETIME,
                  transaction_type ENUM('income', 'expense', 'investment'),
                  description VARCHAR(255),
                  FOREIGN KEY (user_id) REFERENCES users(id)
              );

        2. Setup Connection of database with the application : 
                const db = mysql.createConnection({
                host: 'localhost',    // Replace with your host
                user: 'your_username',         // Replace with your MySQL user
                password: 'your_password',  // Replace with your MySQL password
                database: 'financial_assistant'   // Replace with your database name you created above
              });
            
              // Connect to the database and check for any connection Error
              db.connect((err) => {
                if (err) {
                  console.error('Database connection error: ' + err.stack);
                  return;
                }
                console.log('Connected to the database');
              });

          3. Install expressjs and Nodejs
          4. After Setting up all these things Run following Command On Terminal : 
                >> node app.js      //here "app.js" should be the js file name of you application handling all the routes and backend services.
                                    //If everything is good command will show "database connection successful" as output and server start running on 'localhost port:3000'.
                //Make sure no other app/service is running on this localhost port, if so then change the port at the end in app.js file and run above command again.
          5. Now visit to link "localhost:3000/index.html" to visit Home Page(index.html) to visit application.
