require('dotenv').config();
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
const { exec } = require('child_process');
// Directly specify the file path
const DATA_FILE_PATH = './data.txt';

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
// Utility function to get school abbreviation
function getSchoolAbbreviation(school) {
    const schoolAbbreviations = {
        'KCPS': 'KC',
        'Banjari': 'BJ',
        'Atmanand': 'AT',
        'KV': 'KV',
        'DPS': 'DP',
        'Inventure': 'IV',
        'Others': 'OT'
    };
    return schoolAbbreviations[school] || 'XX'; // Default to 'XX' if school is not in the list
}

// Function to capitalize the first letter and letters after spaces
function formatName(name) {
    return name
        .toLowerCase() // Convert the whole name to lowercase
        .split(' ') // Split the name by spaces
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
        .join(' '); // Join the words back into a single string
}

// Enroll a new student
app.post('/enroll', (req, res) => {
    const students = readDataFile();
    const enrollmentData = req.body;
    enrollmentData.name = formatName(enrollmentData.name); // Format the name

    const startMonth = enrollmentData.month; // Assuming month is passed as string (e.g., "April")

    // Check if a student with the same name, class, and school already exists
    const existingStudent = students.find(student =>
        student.name === enrollmentData.name &&
        student.studentClass === enrollmentData.studentClass &&
        student.school === enrollmentData.school
    );

    if (existingStudent) {
        return res.status(409).json({
            message: `Error : Oops....   Student already exists. Name : ${enrollmentData.name}. Student ID: ${existingStudent.id}`
        });
    }

    // Create a unique ID
    const classCode = enrollmentData.studentClass.toString().padStart(2, '0'); // Ensure 2 digits
    const schoolCode = getSchoolAbbreviation(enrollmentData.school);
    const timestampCode = Date.now().toString().slice(-4); // Last 4 digits of the timestamp

    const uniqueId = `${classCode}${schoolCode}${timestampCode}`; // Combine to form the ID

    // Create the main student entry
    const newStudent = { id: uniqueId, ...enrollmentData, archiveInd: 'No' };
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
    res.json({ message: 'Success : Student Registered Successfully.' });
});



const nodemailer = require('nodemailer');

// Utility function to send email
const sendEmail = async (email, subject, body) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password'
        }
    });

    let mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: subject,
        text: body
    };

    await transporter.sendMail(mailOptions);
};

// Search for students
app.get('/search', async (req, res) => {
    const query = req.query.query ? req.query.query.toLowerCase() : '';
    const email = req.query.email;  // Get email from query parameters
    const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();

    const students = readDataFile();
    let results = [];

    if (query === '@all') {
        // Filter unique students for the current month
        const uniqueStudents = [];
        const uniqueIds = new Set();
        
        students.forEach(student => {
            if (!uniqueIds.has(student.id) && student.month.toLowerCase() === currentMonth) {
                uniqueIds.add(student.id);
                uniqueStudents.push(student);
            }
        });

        results = uniqueStudents;

        // Send email if the email parameter is provided
        if (email) {
            const emailBody = results.map(student => `ID: ${student.id}, Name: ${student.name}, Class: ${student.studentClass}, School: ${student.school}, Month: ${student.month}`).join('\n');
            await sendEmail(email, 'All Students for the Current Month', emailBody);
        }
    } else if (query === 'all') {
        // Return all student records including duplicates
        results = students;
    } else {
        if (query.startsWith('@')) {
            const actualQuery = query.slice(1);  // Remove the '@' prefix
            const filteredStudents = students.filter(student => {
                const idMatch = student.id && student.id.toLowerCase().includes(actualQuery);
                const nameMatch = student.name && student.name.toLowerCase().includes(actualQuery);
                const classMatch = student.studentClass && student.studentClass.toString().toLowerCase().includes(actualQuery);
                const schoolMatch = student.school && student.school.toLowerCase().includes(actualQuery);
                const monthMatch = student.month && student.month.toLowerCase().includes(actualQuery);

                return idMatch || nameMatch || classMatch || schoolMatch || monthMatch;
            });

            // Extract unique students by ID
            const uniqueStudents = [];
            const uniqueIds = new Set();
            
            filteredStudents.forEach(student => {
                if (!uniqueIds.has(student.id)) {
                    uniqueIds.add(student.id);
                    uniqueStudents.push(student);
                }
            });

            results = uniqueStudents;
        } else {
            results = students.filter(student => {
                const idMatch = student.id && student.id.toLowerCase().includes(query);
                const nameMatch = student.name && student.name.toLowerCase().includes(query);
                const classMatch = student.studentClass && student.studentClass.toString().toLowerCase().includes(query);
                const schoolMatch = student.school && student.school.toLowerCase().includes(query);
                const monthMatch = student.month && student.month.toLowerCase().includes(query);

                return idMatch || nameMatch || classMatch || schoolMatch || monthMatch;
            });
        }
    }

    res.json(results);
});



// Update Student Record
app.post('/update', (req, res) => {
    console.log('Received update request:', req.body);

    const { id, name, studentClass, school, date, month, fee, payment } = req.body;
    const students = readDataFile();

    let updatedStudent = null;

    // Loop through each student record
    students.forEach(student => {
        // Check if the student record matches the provided student ID
        if (student.id === id) {
            // Update fields
            if (name !== undefined) {
                console.log(`Updating name to ${name} for student:`, student);
                student.name = name;
            }
            if (studentClass !== undefined) {
                console.log(`Updating class to ${studentClass} for student:`, student);
                student.studentClass = studentClass;
            }
            if (school !== undefined) {
                console.log(`Updating school to ${school} for student:`, student);
                student.school = school;
            }
            if (date !== undefined) {
                console.log(`Updating enroll date to ${date} for student:`, student);
                student.date = date;
            }
            if (fee !== undefined) {
                console.log(`Updating fee to ${fee} for student:`, student);
                student.fee = fee;
            }
            if (month === student.month && payment !== undefined) {
                console.log(`Updating payment to ${payment} for student:`, student);
                student.payment = payment;
            }
            updatedStudent = student;
        }
    });

    if (updatedStudent) {
        writeDataFile(students);

        // Format the student's name
        const nameParts = updatedStudent.name.split(' ');
        const formattedName = nameParts.map((part, index) => 
            index === nameParts.length - 1 ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
        ).join(' ');

        res.json({ message: `Student details updated successfully for - ${formattedName}.` });
    } else {
        console.log('Student record not found or no changes made.');
        res.status(404).json({ message: 'Student record not found or no changes made.' });
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
        res.status(404).json({ message: 'Error : Oops....  Student record not found.' });
    }
});

// Exit student
app.post('/exit', (req, res) => {
    const { id, month } = req.body;
    const students = readDataFile();
    
    // Get all months from the selected month to March
    const months = getMonthsUntilMarch(month);

    // Flag to track if any student was updated
    let updated = false;
    let studentName = '';
    let studentAlreadyInactive = false;

    students.forEach(student => {
        if (student.id === id && months.includes(student.month)) {
            if (student.archiveInd === 'Yes') {
                studentAlreadyInactive = true;
            } else {
                student.archiveInd = 'Yes';
                updated = true;
                studentName = student.name; // Save the student's name for the message
            }
        }
    });

    if (studentAlreadyInactive) {
        res.status(400).json({ message: 'This student is already inactive.' });
    } else if (updated) {
        writeDataFile(students);

        // Capitalize the first letter of the name and surname
        const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
        const formatName = name => {
            const parts = name.split(' ');
            if (parts.length === 2) {
                return `${capitalize(parts[0])} ${capitalize(parts[1])}`;
            }
            return capitalize(name);
        };

        const formattedName = formatName(studentName);

        res.json({ message: `Student ${formattedName} is deleted from Knowledge Point.` });
    } else {
        res.status(404).json({ message: 'Oops, Student record not found or no records to update.' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});