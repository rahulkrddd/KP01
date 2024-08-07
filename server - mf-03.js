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

function getMonthsUntilMarch(startMonth) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const startIndex = months.indexOf(startMonth);
    const endIndex = months.indexOf("March");

    if (startIndex <= endIndex) {
        // Case 1: Start month is before or in March
        return months.slice(startIndex, endIndex + 1);
    } else {
        // Case 2: Start month is after March (i.e., April to December)
        return months.slice(startIndex).concat(months.slice(0, endIndex + 1));
    }
}


// Enroll a new student
app.post('/enroll', (req, res) => {
    const students = readDataFile();
    const enrollmentData = req.body;
    const startMonth = enrollmentData.month; // Assuming month is passed as string (e.g., "April")

    // Check if a student with the same name, class, and school already exists
    const existingStudent = students.find(student =>
        student.name === enrollmentData.name &&
        student.studentClass === enrollmentData.studentClass &&
        student.school === enrollmentData.school
    );

    if (existingStudent) {
        return res.status(409).json({
            message: `Record already exists with name ${enrollmentData.name}. Student ID: ${existingStudent.id}`
        });
    }

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
    
    // Convert query to number if it's numeric
    const queryNumber = isNaN(query) ? null : Number(query);
    
    const results = students.filter(student => {
        const idMatch = queryNumber !== null && student.id === queryNumber;
        const nameMatch = student.name && student.name.toLowerCase().includes(query);
        const classMatch = student.studentClass && student.studentClass.includes(query);
        const schoolMatch = student.school && student.school.toLowerCase().includes(query);
        const monthMatch = student.month && student.month.toLowerCase().includes(query);
        
        return idMatch || nameMatch || classMatch || schoolMatch || monthMatch;
    });
    
    res.json(results);
});



// Update student details
app.post('/update', (req, res) => {
    const { id, month, ...updateData } = req.body;
    const students = readDataFile();
    
    let updated = false;

    // Update all records with the same student ID
    for (let student of students) {
        if (student.id === id) {
            Object.keys(updateData).forEach(key => {
                if (key !== 'payment') {
                    student[key] = updateData[key];
                }
            });
            updated = true;
        }
    }

    if (updated) {
        writeDataFile(students);
        res.json({ message: 'Student details updated successfully for all records.' });
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
    
    // Get all months from the selected month to March
    const months = getMonthsUntilMarch(month);

    // Update all records with the same student ID and month greater than the selected month
    let updated = false;
    students.forEach(student => {
        if (student.id === id && months.includes(student.month) ) {
            student.archiveInd = 'Yes';
            updated = true;
        }
    });

    if (updated) {
        writeDataFile(students);
        res.json({ message: 'Student archived successfully for all relevant records.' });
    } else {
        res.status(404).json({ message: 'Student record not found or no records to update.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
