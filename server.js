const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Serve static files (if you have an HTML file)
app.use(express.static(path.join(__dirname, 'public')));

// Route for the root URL
app.get('/', (req, res) => {
    res.send('<h1>Welcome to Knowledge Point</h1><p>Use the following routes:</p><ul><li><a href="/enroll">Enroll a new student</a></li><li><a href="/search">Search student details</a></li></ul>');
});

// Example route for enrolling a new student
app.post('/enroll', (req, res) => {
    try {
        const data = req.body;
        const id = generateStudentID(data.class);
        const record = `${id}|${data.name}|${data.class}|${data.school}|${data.enrollDate}|${data.feeAmount}|${data.month}|${data.paymentReceived}|No\n`;
        fs.appendFileSync(dataFile, record);
        res.json({ message: `Student enrolled successfully with ID: ${id}` });
    } catch (error) {
        console.error('Error in /enroll route:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Example route for searching student details
app.get('/search', (req, res) => {
    try {
        const query = req.query.query.toLowerCase();
        const records = fs.readFileSync(dataFile, 'utf8').split('\n');
        const results = records.filter(record => record.toLowerCase().includes(query));
        let html = '<ul>';
        results.forEach(record => {
            const fields = record.split('|');
            html += `<li>ID: ${fields[0]}, Name: ${fields[1]}, Class: ${fields[2]}, School: ${fields[3]}, Enroll Date: ${fields[4]}, Fee Amount: ${fields[5]}, Month: ${fields[6]}, Payment Received: ${fields[7]}</li>`;
        });
        html += '</ul>';
        res.send(html);
    } catch (error) {
        console.error('Error in /search route:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Function to generate a unique student ID
function generateStudentID(studentClass) {
    return `${studentClass}-${Date.now()}`;
}

// File path for data storage
const dataFile = path.join(__dirname, 'data.txt');

// Create file if it does not exist
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '');
}

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
