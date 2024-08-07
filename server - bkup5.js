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

// Calculate the number of months from the given start month to March of the following year
function getMonthsUntilMarch(startMonth) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const startIndex = months.indexOf(startMonth);
    const endIndex = months.indexOf("March");
    const monthsToAdd = [];

    // From the start month to December of the current year
    for (let i = startIndex; i < months.length; i++) {
        monthsToAdd.push(months[i]);
    }
    
    // From January to March of the next year
    for (let i = 0; i <= endIndex; i++) {
        monthsToAdd.push(months[i]);
    }

    return monthsToAdd;
}

// Enroll a new student
app.post('/enroll', (req, res) => {
    const students = readDataFile();
    const enrollmentData = req.body;
    const startMonth = enrollmentData.month; // Assuming month is passed as string (e.g., "April")

    // Create the main student entry
    const newStudent = { id: Date.now(), ...enrollmentData, archiveInd: 'No' };
    students.push(newStudent);

    // Create multiple entries for each month until March of the following year
    const months = getMonthsUntilMarch(startMonth);

    months.forEach(month => {
        if (month !== startMonth) {
            const monthlyEntry = { ...newStudent, month, payment: 'No' };
            students.push(monthlyEntry);
        }
    });

    writeDataFile(students);
    res.json({ message: 'Student enrolled and multiple entries created successfully.' });
});

// Search for students
app.get('/search', (req, res) => {
    const query = req.query.query ? req.query.query.toLowerCase() : '';
    const students = readDataFile();
    const results = students.filter(student =>
        (student.name && student.name.toLowerCase().includes(query)) ||
        (student.studentClass && student.studentClass.includes(query)) ||
        (student.school && student.school.toLowerCase().includes(query))
    );
    res.json(results);
});

// Update student details
app.post('/update', (req, res) => {
    const { id, month, ...updateData } = req.body;
    const students = readDataFile();
    
    // Find the index of the student record that matches both id and month
    const index = students.findIndex(student => student.id === id && student.month === month);
    
    if (index !== -1) {
        // Update the student details
        students[index] = { ...students[index], ...updateData };
        writeDataFile(students);
        res.json({ message: 'Student details updated successfully.' });
    } else {
        res.status(404).json({ message: 'Student record not found.' });
    }
});

// Add payment option
app.post('/payment', (req, res) => {
    const { id, month, payment } = req.body;
    const students = readDataFile();
    
    // Find the index of the student record that matches both id and month
    const index = students.findIndex(student => student.id === id && student.month === month);
    
    if (index !== -1) {
        // Update the payment status
        students[index].payment = payment;
        writeDataFile(students);
        res.json({ message: 'Payment status updated successfully.' });
    } else {
        res.status(404).json({ message: 'Student record not found.' });
    }
});

// Exit student
app.post('/exit', (req, res) => {
    const { id, month } = req.body;
    const students = readDataFile();
    
    // Find the index of the student record that matches both id and month
    const index = students.findIndex(student => student.id === id && student.month === month);
    
    if (index !== -1) {
        // Archive the student record
        students[index].archiveInd = 'Yes';
        writeDataFile(students);
        res.json({ message: 'Student archived successfully.' });
    } else {
        res.status(404).json({ message: 'Student record not found.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
