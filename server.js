const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Ensure data file exists
const dataFile = path.join(__dirname, 'data.txt');
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '');
}

// Enroll a new student
app.post('/enroll', (req, res) => {
    const data = req.body;
    const id = generateStudentID(data.class);
