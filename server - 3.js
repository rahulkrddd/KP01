const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

// Utility function to read and parse the data file
function readDataFile() {
    const data = fs.readFileSync('data.txt', 'utf-8');
    return data.trim() ? JSON.parse(data) : [];
}

// Utility function to write to the data file
function writeDataFile(data) {
    fs.writeFileSync('data.txt', JSON.stringify(data, null, 2), 'utf-8');
}

// Enroll a new student
app.post('/enroll', (req, res) => {
    const students = readDataFile();
    const newStudent = { id: Date.now(), ...req.body, archiveInd: 'No' };
    students.push(newStudent);
    writeDataFile(students);
    res.json({ message: 'Student enrolled successfully.' });
});

// Search for students
app.get('/search', (req, res) => {
    const query = req.query.query.toLowerCase();
    const students = readDataFile();
    const results = students.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.class.includes(query) ||
        student.school.toLowerCase().includes(query)
    );
    res.json(results);
});

// Update a student's details
app.post('/update', (req, res) => {
    const students = readDataFile();
    const index = students.findIndex(student => student.id === req.body.id);
    if (index !== -1) {
        students[index] = { ...students[index], ...req.body };
        writeDataFile(students);
        res.json({ message: 'Student details updated successfully.' });
    } else {
        res.status(404).json({ message: 'Student not found.' });
    }
});

// Add payment option
app.post('/payment', (req, res) => {
    const students = readDataFile();
    const index = students.findIndex(student => student.id === req.body.id);
    if (index !== -1) {
        students[index].payment = req.body.payment;
        writeDataFile(students);
        res.json({ message: 'Payment option added successfully.' });
    } else {
        res.status(404).json({ message: 'Student not found.' });
    }
});

// Exit a student
app.post('/exit', (req, res) => {
    const students = readDataFile();
    const index = students.findIndex(student => student.id === req.body.id);
    if (index !== -1) {
        students[index].payment = req.body.payment;
        students[index].archiveInd = 'N';
        writeDataFile(students);
        res.json({ message: 'Student exited successfully.' });
    } else {
        res.status(404).json({ message: 'Student not found.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
