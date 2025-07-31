const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Signup Logic ---
exports.signup = async (req, res) => {
    const { username, phone, password } = req.body; // Changed from email to phone

    try {
        // 1. Check if a user with this phone number already exists
        let user = await User.findOne({ phone }); // Changed from email
        if (user) {
            return res.status(400).json({ msg: 'User with this phone number already exists' });
        }

        // 2. If not, create a new user instance
        user = new User({ username, phone, password }); // Changed from email

        // 3. Hash the password before saving it
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // 4. Save the new user to the database
        await user.save();

        // 5. Create a JSON Web Token (JWT) for the new user
        const payload = {
            user: { id: user.id, role: user.role },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// --- Login Logic ---
exports.login = async (req, res) => {
    const { phone, password } = req.body; // Changed from email to phone

    try {
        // 1. Check if a user with that phone number exists
        let user = await User.findOne({ phone }); // Changed from email
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 2. Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 3. If credentials are correct, create and return a new token
        const payload = {
            user: { id: user.id, role: user.role },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '5h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};
