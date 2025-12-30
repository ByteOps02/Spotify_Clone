const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const dbPath = path.join(__dirname, 'db', 'users.json');

// Helper function to read users from the database
const readUsers = () => {
    if (!fs.existsSync(dbPath)) {
        return [];
    }
    const usersJson = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(usersJson);
};

// Helper function to write users to the database
const writeUsers = (users) => {
    fs.writeFileSync(dbPath, JSON.stringify(users, null, 2));
};

// Signup endpoint
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    const users = readUsers();
    if (users.find(u => u.username === username || u.email === email)) {
        return res.status(400).json({ message: 'User with this username or email already exists.' });
    }

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            return res.status(500).json({ message: 'Error hashing password.' });
        }
        users.push({ username, email, password: hash });
        writeUsers(users);
        res.status(201).json({ message: 'Signup successful! Please sign in.' });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.username === username || u.email === username);

    if (!user) {
        return res.status(400).json({ message: 'Invalid username/email or password.' });
    }

    bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
            const { password, ...userWithoutPassword } = user;
            res.status(200).json({ message: 'Login successful! Redirecting...', user: userWithoutPassword });
        } else {
            res.status(400).json({ message: 'Invalid username/email or password.' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
