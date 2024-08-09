import express from 'express';
import fs from 'fs';
import { Octokit } from '@octokit/rest';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// GitHub API configuration
const GITHUB_REPO = 'rahulkrddd/KP01';
const FILE_PATH = 'data.txt';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const octokit = new Octokit({
    auth: GITHUB_TOKEN
});



const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;


// Utility function to read and parse the data file
async function readDataFile() {
    try {
        const { data } = await octokit.rest.repos.getContent({
            owner: 'rahulkrddd',
            repo: 'KP01',
            path: FILE_PATH
        });

        if (data && data.content) {
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            return content.trim() ? JSON.parse(content) : [];
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error reading data file from GitHub:', error);
        return [];
    }
}

// Utility function to write to the data file
const content = Buffer.from('Your file content here').toString('base64');

async function writeDataFile(data) {
    try {
        // Encode content in Base64
        const content = Buffer.from(JSON.stringify(data, null, 2), 'utf-8').toString('base64');

        // Get the current SHA of the file
        const { data: fileData } = await octokit.rest.repos.getContent({
            owner: 'rahulkrddd',
            repo: 'KP01',
            path: FILE_PATH
        });

        // Update the file on GitHub
        await octokit.rest.repos.createOrUpdateFileContents({
            owner: 'rahulkrddd',
            repo: 'KP01',
            path: FILE_PATH,
            message: 'Update data.txt',
            content: content,
            sha: fileData.sha // Provide the correct SHA
        });
    } catch (error) {
        console.error('Error writing data file to GitHub:', error);
    }
}




async function getFileSHA() {
  try {
    const { data } = await octokit.repos.getContent({
      owner: 'rahulkrddd',
      repo: 'KP01',
      path: 'data.txt',
      ref: 'main' // Branch name
    });
    return data.sha;
  } catch (error) {
    console.error('Error retrieving file SHA:', error);
    throw error;
  }
}

getFileSHA().then(sha => {
  console.log('Current SHA:', sha);
});


// Utility function to get the list of months until March
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

// Utility function to send email
const sendEmail = async (email, subject, body) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: subject,
        text: body
    };

    await transporter.sendMail(mailOptions);
};

// Enroll a new student
app.post('/enroll', async (req, res) => {
    try {
        const students = await readDataFile();
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

        await writeDataFile(students);
        res.json({ message: 'Success : Student Registered Successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error enrolling student.' });
    }
});

// Search for students
app.get('/search', async (req, res) => {
    try {
        const query = req.query.query ? req.query.query.toLowerCase() : '';
        const email = req.query.email;  // Get email from query parameters
        const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();

        const students = await readDataFile();
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
    } catch (error) {
        res.status(500).json({ message: 'Error searching students.' });
    }
});

// Update Student Record
app.post('/update', async (req, res) => {
    try {
        const { id, name, studentClass, school, date, month, fee, payment } = req.body;
        const students = await readDataFile();
        const studentIndex = students.findIndex(student => student.id === id);

        if (studentIndex === -1) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        if (name) students[studentIndex].name = formatName(name);
        if (studentClass) students[studentIndex].studentClass = studentClass;
        if (school) students[studentIndex].school = school;
        if (date) students[studentIndex].date = date;
        if (month) students[studentIndex].month = month;
        if (fee) students[studentIndex].fee = fee;
        if (payment) students[studentIndex].payment = payment;

        await writeDataFile(students);
        res.json({ message: 'Success : Student record updated successfully.' });
    } catch (error) {
        console.error('Error updating student record:', error);
        res.status(500).json({ message: 'Error updating student record.' });
    }
});


// Archive Student
app.post('/archive', async (req, res) => {
    try {
        const { id } = req.body;
        const students = await readDataFile();
        const studentIndex = students.findIndex(student => student.id === id);

        if (studentIndex === -1) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        if (students[studentIndex].archiveInd === 'Yes') {
            return res.status(400).json({ message: 'Student is already archived.' });
        }

        students[studentIndex].archiveInd = 'Yes';
        await writeDataFile(students);
        res.json({ message: 'Success : Student archived successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error archiving student.' });
    }
});





// View Students
app.get('/view', async (req, res) => {
    try {
        const students = await readDataFile();
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving student records.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
