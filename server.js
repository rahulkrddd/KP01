const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;
const multer = require('multer');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });
const { google } = require('googleapis');


app.use(bodyParser.json());
app.use(express.static('public'));

const GITHUB_REPO = 'rahulkrddd/KP01';
const FILE_PATH = 'data.txt';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API_BASE = 'https://api.github.com';





const path = require('path');

require('dotenv').config(); // Load environment variables from .env file


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Password validation endpoint
app.post('/validate-password', (req, res) => {
    const {password} = req.body;
    // Get the password from environment variables
    const validPassword = process.env.PASSWORD;

    if (password === validPassword) {
        res.json({ valid: true });
    } else {
        res.json({ valid: false });
    }
});







// Utility function to read and parse the data file from GitHub
async function readDataFile() {
    try {
        const response = await axios.get(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        const fileContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
        return fileContent.trim() ? JSON.parse(fileContent) : [];
    } catch (error) {
        console.error('Error reading file from GitHub:', error);
        throw new Error('Error reading file from GitHub');
    }
}

// Utility function to write to the data file on GitHub
async function writeDataFile(data) {
    try {
        const fileContent = Buffer.from(JSON.stringify(data, null, 2), 'utf-8').toString('base64');
        const { data: fileInfo } = await axios.get(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
        
        await axios.put(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            message: 'Update data.txt',
            content: fileContent,
            sha: fileInfo.sha
        }, {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
        });
    } catch (error) {
        console.error('Error writing file to GitHub:', error);
        throw new Error('Error writing file to GitHub');
    }
}

function getMonthsUntilMarch(startMonth) {
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const startIndex = months.indexOf(startMonth);
    const endIndex = months.indexOf("March");

    if (startIndex <= endIndex) {
        return months.slice(startIndex, endIndex + 1);
    } else {
        return months.slice(startIndex).concat(months.slice(0, endIndex + 1));
    }
}

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
    return schoolAbbreviations[school] || 'XX';
}

function formatName(name) {
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}



// Setup email transport using App Password
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD // App Password
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Handle email sending
app.post('/send-email', upload.single('file'), async (req, res) => {
    const file = req.file;
    const filePath = path.join(__dirname, 'uploads', file.filename);

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, async (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'File does not exist' });
        }

        // Read the file content
        fs.readFile(filePath, async (err, data) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error reading file', error: err.message });
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: 'rahul.gupta.730@gmail.com',
                subject: 'Report',
                text: 'Please find the attached report.',
                attachments: [{
                    filename: 'report.csv',
                    content: data
                }]
            };

            // Send the email
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Error sending email:', error);
                    return res.status(500).json({ success: false, message: 'Error sending email', error: error.message });
                }

                // Clean up uploaded file
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                        return res.status(500).json({ success: false, message: 'Error deleting file', error: err.message });
                    }
                    res.json({ success: true, message: 'Email sent successfully!' });
                });
            });
        });
    });
});


//Setup email transport V0.2


// Enroll a new student
app.post('/enroll', async (req, res) => {
    try {
        const students = await readDataFile();
        const enrollmentData = req.body;
        enrollmentData.name = formatName(enrollmentData.name);

        const startMonth = enrollmentData.month;

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

        const classCode = enrollmentData.studentClass.toString().padStart(2, '0');
        const schoolCode = getSchoolAbbreviation(enrollmentData.school);
        const timestampCode = Date.now().toString().slice(-4);

        const uniqueId = `${classCode}${schoolCode}${timestampCode}`;

        const newStudent = { id: uniqueId, ...enrollmentData, archiveInd: 'No' };
        students.push(newStudent);

        const months = getMonthsUntilMarch(startMonth);

        months.forEach(month => {
            if (month !== startMonth) {
                const monthlyEntry = { ...newStudent, month, payment: 'No' };
                students.push(monthlyEntry);
            }
        });

        await writeDataFile(students);
        res.json({ message: 'Success : Student Registered Successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Oops.. Error occurred during enrollment.' });
    }
});

// Search for students
app.get('/search', async (req, res) => {
    try {
        const query = req.query.query ? req.query.query.toLowerCase() : '';
        const email = req.query.email;
        const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();

        const students = await readDataFile();
        let results = [];

        if (query === '@all') {
            const uniqueStudents = [];
            const uniqueIds = new Set();
            
            students.forEach(student => {
                if (!uniqueIds.has(student.id) && student.month.toLowerCase() === currentMonth) {
                    uniqueIds.add(student.id);
                    uniqueStudents.push(student);
                }
            });

            results = uniqueStudents;

            if (email) {
                const emailBody = results.map(student => `ID: ${student.id}, Name: ${student.name}, Class: ${student.studentClass}, School: ${student.school}, Month: ${student.month}`).join('\n');
                await sendEmail(email, 'All Students for the Current Month', emailBody);
            }
        } else if (query === 'all') {
            results = students;
        } else {
            if (query.startsWith('@')) {
                const actualQuery = query.slice(1);
                const filteredStudents = students.filter(student => {
                    const idMatch = student.id && student.id.toLowerCase().includes(actualQuery);
                    const nameMatch = student.name && student.name.toLowerCase().includes(actualQuery);
                    const classMatch = student.studentClass && student.studentClass.toString().toLowerCase().includes(actualQuery);
                    const schoolMatch = student.school && student.school.toLowerCase().includes(actualQuery);
                    const monthMatch = student.month && student.month.toLowerCase().includes(actualQuery);

                    return idMatch || nameMatch || classMatch || schoolMatch || monthMatch;
                });

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
    } catch (error) {
        res.status(500).json({ message: 'Error occurred during search.' });
    }
});

app.post('/update', async (req, res) => {
    try {
        console.log('Received update request:', req.body);

        const { id, name, studentClass, school, date, month, fee, payment } = req.body;
        const students = await readDataFile();

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

                    // Update the student ID's first two characters with the class
                    const classCode = studentClass.length === 1 ? `0${studentClass}` : studentClass.substring(0, 2);
                    student.id = `${classCode}${student.id.slice(2)}`;
                }
                if (school !== undefined) {
                    console.log(`Updating school to ${school} for student:`, student);
                    student.school = school;

                    // Update the student ID's 3rd and 4th characters with the school abbreviation
                    const schoolAbbr = getSchoolAbbreviation(school);
                    student.id = `${student.id.slice(0, 2)}${schoolAbbr}${student.id.slice(4)}`;
                }
                if (date !== undefined) {
                    console.log(`Updating enroll date to ${date} for student:`, student);
                    student.date = date;
                }
                if (fee !== undefined) {
                    console.log(`Updating fee to ${fee} for student:`, student);
                    student.fee = fee;
                }
                if (month !== undefined && payment !== undefined && student.month === month) {
                    console.log(`Updating payment to ${payment} for student:`, student);
                    student.payment = payment;
                }
                updatedStudent = student;
            }
        });

        if (updatedStudent) {
            await writeDataFile(students);

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
    } catch (error) {
        console.error('Error occurred during update:', error);
        res.status(500).json({ message: 'Error occurred during update.' });
    }
});


// Add payment option
// Add payment option
app.post('/payment', async (req, res) => {
    try {
        const { id, month, payment } = req.body;

        // Read data file asynchronously
        const students = await readDataFile();
        
        // Find the index of the student record that matches both id and month
        const index = students.findIndex(student => student.id === id && student.month === month);
        
        if (index !== -1) {
            // Update the payment status
            students[index].payment = payment;

            // Write updated data back to the file asynchronously
            await writeDataFile(students);
            res.json({ message: 'Payment status updated successfully.' });
        } else {
            res.status(404).json({ message: 'Error: Student record not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error occurred while updating payment status.' });
    }
});


// Exit (archive) a student
// Exit (archive) a student
app.post('/exit', async (req, res) => {
    const { id, month, deletepermanently } = req.body;

    try {
        // Read data file asynchronously
        const students = await readDataFile();

        // Log the received deletepermanently value for debugging
        console.log('Received deletepermanently:', deletepermanently);

        if (deletepermanently === true) {
            // Delete records with the given ID
            const remainingStudents = students.filter(student => student.id !== id);

            if (students.length === remainingStudents.length) {
                // No student with the given ID was found
                return res.status(404).json({ message: 'Student record not found.' });
            }

            // Write the updated data back to the file
            await writeDataFile(remainingStudents);

            return res.json({ message: 'Student record(s) deleted permanently.' });
        }

        // If deletepermanently is not 'on', perform existing logic to archive
        const months = getMonthsUntilMarch(month);

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
            // Write updated data back to the file
            await writeDataFile(students);

            // Capitalize the first letter of the name and surname
            const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
            const formatName = name => {
                const parts = name.split(' ');
                return parts.map(part => capitalize(part)).join(' ');
            };

            const formattedName = formatName(studentName);

            res.json({ message: `Student ${formattedName} has been marked as inactive.` });
        } else {
            res.status(404).json({ message: 'Oops, student record not found or no records to update.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error occurred while processing the request.' });
    }
});



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
