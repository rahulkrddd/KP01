// routes/HISTORY.js
const express = require('express');
const router = express.Router();

// Define your routes here
router.post('/validate-password', (req, res) => {
    console.log('Endpoint /validate-password hit');
    const { password } = req.body;
    const validPassword = process.env.PASSWORD;

    console.log('Received password:', password);
    console.log('Valid password from environment:', validPassword);

    if (password === validPassword) {
        console.log('Password is valid');
        res.json({ valid: true });
    } else {
        console.log('Password is invalid');
        res.json({ valid: false });
    }
});

module.exports = router;
