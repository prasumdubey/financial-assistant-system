const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');


// Load environment variables from .env file
require('dotenv').config();

const app = express();

// Set the view engine to ejs
app.set('view engine', 'ejs');

// Set the location of the views directory
app.set('views', path.join(__dirname, 'views'));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Use session middleware
app.use(session({
    secret: 'mySuperSecretKey12345!', // Example secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }  // If using HTTPS, set this to true
  })
);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });
  
// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection error: ' + err.stack);
        return;
    }
    console.log('Connected to the database');
});

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
}

const axios = require('axios');


// GET route for the homepage (redirect to dashboard if authenticated)
app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.redirect('/dashboard');
    } else {
        res.render('index');  // Render the front page if not logged in
    }
});

// GET route to serve signup page
app.get('/signup', (req, res) => {
    res.render('signup');  // Render signup.ejs
});

// POST route to handle signup form submission
app.post('/signup', (req, res) => {
    const {
        first_name,
        last_name,
        age,
        gender,
        isd_code,
        contact,
        email,
        security_question,
        security_answer,
        password,
        confirm_password
    } = req.body;

    // Ensure the passwords match
    if (password !== confirm_password) {
        return res.send('Passwords do not match');
    }

    // Hash the password for secure storage
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Check if the email already exists
    const checkQuery = 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)';
    db.query(checkQuery, [email], (err, results) => {
        if (err) {
            console.error('Error checking email existence:', err);
            return res.status(500).send('Error during signup.');
        }

        if (results.length > 0) {
            return res.send('Email already in use. <a href="/login">Login here</a>');
        }

        // Insert data into the users table if email does not exist
        const insertQuery = `
            INSERT INTO users (
                first_name,
                last_name,
                age,
                gender,
                isd_code,
                contact,
                email,
                security_question,
                security_answer,
                password
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(insertQuery, [
            first_name,
            last_name,
            age,
            gender,
            isd_code,
            contact,
            email,
            security_question,
            security_answer,
            hashedPassword
        ], (err) => {
            if (err) {
                console.error('Error inserting data:', err);
                return res.status(500).send('Error creating user.');
            }

            // Success response
            res.send('User created successfully! <a href="/login">Login here</a>');
        });
    });
});


// POST route to handle login form submission
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Check if email or password is empty
    if (!email || !password) {
        return res.send('Email and password are required.');
    }

    // Query to fetch user by email (case-insensitive using LOWER())
    const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)';
    
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Error logging in.');
        }

        // Check if user exists
        if (results.length === 0) {
            return res.send('Invalid email or password. <a href="/login">Try again</a>');
        }

        const user = results[0];
        
        // Compare the provided password with the hashed password in the database
        const passwordIsValid = bcrypt.compareSync(password, user.password);

        if (passwordIsValid) {
            // Set session variables
            req.session.loggedIn = true;
            req.session.email = user.email;
            req.session.user = user;
            
            // Redirect to the dashboard after successful login
            res.redirect('/dashboard');
        } else {
            // If the password is incorrect
            res.send('Invalid email or password. <a href="/login">Try again</a>');
        }
    });
});


// GET route to serve login page
app.get('/login', (req, res) => {
    res.render('login');
});

// Function to generate a random 6-digit password
function generateRandomPassword() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generates a random number between 100000 and 999999
}

// POST route for forget password
app.post('/forget_password', async (req, res) => {
    const { email, security_question, security_answer } = req.body;

    try {
        // Query to find user by email
        const query = 'SELECT * FROM users WHERE LOWER(email) = LOWER(?)';
        db.query(query, [email], (err, results) => {
            if (err) {
                console.error('Error querying the database:', err);
                return res.status(500).send('An error occurred. Please try again later.');
            }

            const user = results[0];

            if (!user) {
                return res.send('Email ID is not registered.');
            }

            // Check security question and answer
            if (user.security_question === security_question && user.security_answer === security_answer) {
                // Generate a new random password
                const newPassword = generateRandomPassword();
                const hashedPassword = bcrypt.hashSync(newPassword, 10); // Hash the new password

                // Update the user's password in the database
                const updateQuery = 'UPDATE users SET password = ? WHERE email = ?';
                db.query(updateQuery, [hashedPassword, email], (err) => {
                    if (err) {
                        console.error('Error updating password:', err);
                        return res.status(500).send('An error occurred while updating the password.');
                    }

                    // Return the new password to the user
                    return res.send(`Your new password is: ${newPassword}`);
                });
            } else {
                return res.send('Security question or answer is incorrect.');
            }
        });
    } catch (error) {
        console.error('Error in forget-password process:', error);
        return res.send('An error occurred. Please try again later.');
    }
});

app.get('/forget_password', (req, res) => {
    res.render('forget_password');
});


// GET route to handle logout
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
});

// GET route to serve dashboard (protected)
app.get('/dashboard', isAuthenticated, (req, res) => {
    // Use email to fetch user information
    const user = req.session.user || { full_name: "Guest" };
    res.render('dashboard', { user: user });
});

// GET and POST routes for profile settings (protected)
app.get('/profile', isAuthenticated, (req, res) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [req.session.email], (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).send('Error fetching profile.');
        }

        const user = results[0];
        res.render('profile', { user });
    });
});

app.post('/edit-profile', isAuthenticated, (req, res) => {
    const { 
        first_name, 
        last_name, 
        email, 
        isd_code, 
        contact 
    } = req.body;

    const query = `
        UPDATE users 
        SET first_name = ?, last_name = ?, email = ?, isd_code = ?, contact = ? 
        WHERE email = ?
    `;
    
    db.query(query, [first_name, last_name, email, isd_code, contact, req.session.email], (err) => {
        if (err) {
            console.error('Error updating profile:', err);
            return res.status(500).send('Error updating profile.');
        }

        // Update session email if the email has been changed
        req.session.email = email;
        
        res.send('Profile updated successfully! <a href="/dashboard">Back to Dashboard</a>');
    });
});


// GET and POST routes for changing password (protected)
app.get('/change-password', isAuthenticated, (req, res) => {
    res.render('change-password');
});

app.post('/change-password', isAuthenticated, (req, res) => {
    const { old_password, new_password, confirm_new_password } = req.body;

    if (new_password !== confirm_new_password) {
        return res.send('New passwords do not match.');
    }

    const query = 'SELECT password FROM users WHERE email = ?';
    db.query(query, [req.session.email], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).send('Error changing password.');
        }

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(old_password, user.password);

        if (!passwordIsValid) {
            return res.send('Old password is incorrect.');
        }

        const hashedPassword = bcrypt.hashSync(new_password, 10);
        const updateQuery = 'UPDATE users SET password = ? WHERE email = ?';
        db.query(updateQuery, [hashedPassword, req.session.email], (err) => {
            if (err) {
                console.error('Error updating password:', err);
                return res.status(500).send('Error updating password.');
            }
            res.send('Password changed successfully! <a href="/dashboard">Back to Dashboard</a>');
        });
    });
});

// GET and POST routes for financial details (protected)
app.get('/financial-details', isAuthenticated, (req, res) => {
    const query = 'SELECT * FROM financial_info WHERE email = ?';
    db.query(query, [req.session.email], (err, results) => {
        if (err) {
            console.error('Error fetching financial data:', err);
            return res.status(500).send('Error fetching financial details.');
        }

        const financialData = results[0] || {};
        res.render('financial-details', { financialData });
    });
});

app.post('/financial-details', isAuthenticated, (req, res) => {
    const { total_assets, income, expenses, debt, savings, profit } = req.body;

    // Calculate total liabilities from debts (assuming debts are part of liabilities)
    const total_liabilities = debt; // Adjust if you have more logic for liabilities

    const totalAmountUpdated = parseFloat(total_assets) + parseFloat(income) + parseFloat(savings);
    const checkQuery = 'SELECT * FROM financial_info WHERE email = ?';
    db.query(checkQuery, [req.session.email], (err, results) => {
        if (err) {
            console.error('Error checking financial data:', err);
            return res.status(500).send('Error saving financial details.');
        }

        const actionDescription = `Updated total_assets: ${total_assets}, income: ${income}, savings: ${savings}`;
        const timestamp = new Date();

        if (results.length > 0) {
            // Update existing financial data
            const updateQuery = 'UPDATE financial_info SET total_assets = ?, total_liabilities = ?, income = ?, expenses = ?, debt = ?, savings = ?, profit = ? WHERE email = ?';
            db.query(updateQuery, [total_assets, total_liabilities, income, expenses, debt, savings, profit, req.session.email], (err) => {
                if (err) {
                    console.error('Error updating financial data:', err);
                    return res.status(500).send('Error updating financial details.');
                }

                // Update history table
                const historyUpdateQuery = 'INSERT INTO history (email, action, amount, profit_loss, remaining_balance, timestamp) VALUES (?, ?, ?, ?, ?, ?)';
                db.query(historyUpdateQuery, [req.session.email, actionDescription, totalAmountUpdated, profit, savings, timestamp], (err) => {
                    if (err) {
                        console.error('Error saving history data:', err);
                        return res.status(500).send('Error updating history.');
                    }
                    res.send('Financial details updated successfully! <a href="/dashboard">Back to Dashboard</a>');
                });
            });
        } else {
            // Insert new financial data
            const insertQuery = 'INSERT INTO financial_info (email, total_assets, total_liabilities, income, expenses, debt, savings, profit) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            db.query(insertQuery, [req.session.email, total_assets, total_liabilities, income, expenses, debt, savings, profit], (err) => {
                if (err) {
                    console.error('Error saving financial data:', err);
                    return res.status(500).send('Error saving financial details.');
                }

                // Insert into history table
                const historyInsertQuery = 'INSERT INTO history (email, action, amount, profit_loss, remaining_balance, timestamp) VALUES (?, ?, ?, ?, ?, ?)';
                db.query(historyInsertQuery, [req.session.email, actionDescription, totalAmountUpdated, profit, savings, timestamp], (err) => {
                    if (err) {
                        console.error('Error saving history data:', err);
                        return res.status(500).send('Error saving history.');
                    }
                    res.send('Financial details saved successfully! <a href="/dashboard">Back to Dashboard</a>');
                });
            });
        }
    });
});

// Route to render the predict investment page
app.get('/predict-investment', isAuthenticated, (req, res) => {
    res.render('predict-investment');
});
app.post('/can-invest', isAuthenticated, (req, res) => {
    const query = 'SELECT income, total_assets, expenses, debt, total_liabilities, savings, profit FROM financial_info WHERE email = ?';
    
    db.query(query, [req.session.email], (err, results) => {
        if (err) {
            console.error('Error fetching financial data:', err);
            return res.status(500).send('Error fetching financial data.');
        }

        if (results.length === 0) {
            return res.status(404).send('No financial data found.');
        }

        const financialData = results[0];

        // Calculate the safe money based on the formula
        const safeMoney = (
            0.5 * (parseFloat(financialData.income) - parseFloat(financialData.expenses)) +
            0.2 * parseFloat(financialData.total_assets) -
            0.7 * parseFloat(financialData.debt) -
            0.6 * parseFloat(financialData.total_liabilities) +
            0.4 * parseFloat(financialData.savings) +
            0.5 * parseFloat(financialData.profit)
        );

        res.json({ safeMoney: safeMoney.toFixed(2) }); // Return the result as JSON
    });
});



app.get('/history', isAuthenticated, (req, res) => {
    const query = 'SELECT * FROM history WHERE email = ? ORDER BY timestamp DESC';
    
    db.query(query, [req.session.email], (err, results) => {
        if (err) {
            console.error('Error retrieving history:', err);
            return res.status(500).send('Error retrieving transaction history.');
        }

        res.render('history', { transactions: results });
    });
});




// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
