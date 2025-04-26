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
     4. Data Analysis : Python pandas, numpy, scikit-learn
     5. Machine Learning Model : Gradient Boost
     6. Visualisation Tools : Chart.js
     7. Other Tools : Vs Code, Github, Mysql Workbench

# Steps to Setup the application :-
     1. Setup MYSQL Database :
           -- Create Database financial_assistant
              CREATE DATABASE `financial_assistant`;

           -- Create the users table
              use financial_assistant;
              CREATE TABLE `users` (
                 `email` varchar(100) NOT NULL,
                 `first_name` varchar(50) DEFAULT NULL,
                 `last_name` varchar(50) DEFAULT NULL,
                 `age` int DEFAULT NULL,
                 `gender` enum('Male','Female','Other') DEFAULT NULL,
                 `isd_code` varchar(10) DEFAULT '+91',
                 `contact` varchar(15) DEFAULT NULL,
                 `security_question` varchar(255) DEFAULT NULL,
                 `security_answer` varchar(255) DEFAULT NULL,
                 `password` varchar(255) DEFAULT NULL,
                 PRIMARY KEY (`email`)
             ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


           -- Create the financial_data table
              use financial_assistant;
              CREATE TABLE `financial_info` (
                 `id` int NOT NULL AUTO_INCREMENT,
                 `email` varchar(100) NOT NULL,
                 `total_assets` decimal(15,2) DEFAULT '0.00',
                 `total_liabilities` decimal(15,2) DEFAULT '0.00',
                 `income` decimal(15,2) DEFAULT '0.00',
                 `expenses` decimal(15,2) DEFAULT '0.00',
                 `debt` decimal(15,2) DEFAULT '0.00',
                 `savings` decimal(15,2) DEFAULT '0.00',
                 `profit` decimal(15,2) DEFAULT NULL,
                 PRIMARY KEY (`id`),
                 KEY `email` (`email`),
                 CONSTRAINT `financial_info_ibfk_1` FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE CASCADE
             ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

              
            -- Create the transactions table
              use financial_assistant;
              CREATE TABLE `history` (
                 `id` int NOT NULL AUTO_INCREMENT,
                 `email` varchar(100) NOT NULL,
                 `action` varchar(255) NOT NULL,
                 `amount` decimal(15,2) NOT NULL,
                 `profit_loss` decimal(15,2) NOT NULL,
                 `remaining_balance` decimal(15,2) NOT NULL,
                 `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
                 PRIMARY KEY (`id`),
                 KEY `email` (`email`),
                 CONSTRAINT `history_ibfk_1` FOREIGN KEY (`email`) REFERENCES `users` (`email`) ON DELETE CASCADE
             ) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


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
          5. Now visit to link "localhost:3001/index.html" to visit Home Page(index.html) to visit application.
