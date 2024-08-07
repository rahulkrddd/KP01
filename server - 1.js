const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Route for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for enrolling a new student
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

// Route for searching student details
app.get('/search', (req, res) => {
    try {
        const query = req.query.query.toLowerCase();
        const records = fs.readFileSync(dataFile, 'utf8').split('\n');
        const results = records.filter(record => record.toLowerCase().includes(query));
        res.json(results);
    } catch (error) {
        console.error('Error in /search route:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Route for updating student details
app.post('/update', (req, res) => {
    try {
        const data = req.body;
        const records = fs.readFileSync(dataFile, 'utf8').split('\n');
        const updatedRecords = records.map(record => {
            const fields = record.split('|');
            if (fields[0] === data.id) {
                return `${fields[0]}|${data.name}|${data.class}|${data.school}|${data.enrollDate}|${data.feeAmount}|${data.month}|${data.paymentReceived}|No`;
            }
            return record;
        });
        fs.writeFileSync(dataFile, updatedRecords.join('\n'));
        res.json({ message: 'Student details updated successfully' });
    } catch (error) {
        console.error('Error in /update route:', error);
        res.status(500).json({ message: 'Internal Server Error' });
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
