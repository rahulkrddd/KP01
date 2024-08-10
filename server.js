const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const app = express();
const PORT = process.env.PORT || 3000;

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
    const { password } = req.body;
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

async function sendEmail(email, subject, body) {
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
}

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
        res.status(500).json({ message: 'Error occurred during enrollment.' });
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

// Update student details
// Update Student Record
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
app.post('/exit', async (req, res) => {
    const { id, month } = req.body;

    try {
        // Read data file asynchronously
        const students = await readDataFile();

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
