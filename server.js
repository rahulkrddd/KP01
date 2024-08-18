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
const moment = require('moment');  // for handling timestamps


app.use(bodyParser.json());
app.use(express.static('public'));

const GITHUB_REPO = 'rahulkrddd/KP01';
const FILE_PATH = 'data.txt';
const historyFilePath = 'history.txt';
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
                to: process.env.EMAIL_RECIPIENT, 
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


//**********************************************ENROLL START *****************************************************//
//history file write
const writeHistoryFile2 = async (studentData) => {
    const historyFilePath = 'history.txt';
    const commitMessage = 'Update history file';

    // Extract and format data fields
    const {
        id,
        name,
        studentClass,
        school,
        date,
        fee,
        month,
        payment,
        archiveInd
    } = studentData;

    const formattedName = name.padEnd(18, ' ').substring(0, 18);
    const formattedClass = studentClass.toString().padStart(2, '0').substring(0, 2);
    const formattedSchool = school.padEnd(10, ' ').substring(0, 10);
    const formattedFee = fee.toString().padStart(5, ' ').substring(0, 5);
    const formattedMonth = month.padEnd(10, ' ').substring(0, 10);
    const formattedPayment = payment.substring(0, 1);
    const formattedArchiveInd = archiveInd.substring(0, 1);

    // Generate and format the timestamp in IST
    const nowUTC = new Date();
    const nowIST = new Date(nowUTC.getTime() + 5.5 * 60 * 60 * 1000); // Add 5 hours 30 minutes
    const timestamp = nowIST.toISOString().replace('T', ' ').substring(0, 19); // Format to YYYY-MM-DD HH:MM:SS

    // Prepare the content with timestamp
    const content = `${id} PASS ENROLL  ${formattedName} ${formattedClass} ${formattedSchool} ${date} ${formattedFee} ${formattedMonth} ${formattedPayment} ${formattedArchiveInd} X X X ${timestamp}\n`;

    // Get the current content of history.txt
    const { data: { content: currentContent, sha } } = await axios.get(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${historyFilePath}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });

    // Decode the base64 content and append the new data
    const updatedContent = Buffer.from(currentContent, 'base64').toString('utf-8') + content;
    const encodedContent = Buffer.from(updatedContent).toString('base64');

    // Update the file on GitHub
    await axios.put(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${historyFilePath}`, {
        message: commitMessage,
        content: encodedContent,
        sha
    }, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
    });
};
	


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
        
        // Write to history.txt
        await writeHistoryFile2(newStudent);

        res.json({ message: 'Success : Student Registered Successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Oops.. Error occurred during enrollment.' });
    }
});
//**********************************************ENROLL END   *****************************************************//

//**********************************************SEARCH START *****************************************************//
// Search for students
app.get('/search', async (req, res) => {
    try {
        const query = req.query.query ? req.query.query.toLowerCase() : '';
        const email = req.query.email;
        const currentMonth = new Date().toLocaleString('default', { month: 'long' }).toLowerCase();

        const students = await readDataFile();
        let results = [];

        // Helper function to validate and extract pattern
        function validatePattern(q) {
            const isValid = /^(\d{2}[a-zA-Z]{3}|\w{3}\d{2})$/.test(q);
            if (isValid) {
                const isAlphaFirst = /^\d{2}[a-zA-Z]{3}/.test(q);
                const isNumFirst = /^[a-zA-Z]{3}\d{2}/.test(q);
                return { isAlphaFirst, isNumFirst };
            }
            return { isAlphaFirst: false, isNumFirst: false };
        }

        // Pattern matching and processing
        const pattern = validatePattern(query);
        if (pattern.isAlphaFirst || pattern.isNumFirst) {
            const idPart = pattern.isAlphaFirst ? query.slice(0, 2) : query.slice(3, 5);
            const monthPart = pattern.isAlphaFirst ? query.slice(2, 5) : query.slice(0, 3);

            results = students.filter(student => {
                const idMatch = student.id && student.id.toLowerCase().startsWith(idPart);
                const monthMatch = student.month && student.month.toLowerCase().includes(monthPart);
                return idMatch && monthMatch;
            });
        } else {
            // Existing query handling logic
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
                const queryLength = query.length;

                if (query.startsWith('@')) {
                    const actualQuery = query.slice(1);
                    const filteredStudents = students.filter(student => {
                        const idMatch = student.id && (
                            (queryLength === 8 && student.id.toLowerCase() === actualQuery) ||
                            (queryLength < 8 && student.id.toLowerCase().startsWith(actualQuery))
                        );
                        const nameMatch = student.name && student.name.toLowerCase().includes(actualQuery);
                        const classMatch = student.studentClass && student.studentClass.toString().toLowerCase().includes(actualQuery);
                        const schoolMatch = student.school && student.school.toLowerCase().includes(actualQuery);
                        const monthMatch = student.month && student.month.toLowerCase().includes(actualQuery);

                        return idMatch || nameMatch || classMatch || schoolMatch || monthMatch;
                    });

                    // Separate current month results from other results
                    const currentMonthResults = filteredStudents.filter(student => student.month.toLowerCase() === currentMonth);
                    const otherMonthResults = filteredStudents.filter(student => student.month.toLowerCase() !== currentMonth);

                    // Combine current month results with other month results
                    results = [...currentMonthResults, ...otherMonthResults];

                    // Remove duplicate entries based on ID
                    const uniqueStudents = [];
                    const uniqueIds = new Set();

                    results.forEach(student => {
                        if (!uniqueIds.has(student.id)) {
                            uniqueIds.add(student.id);
                            uniqueStudents.push(student);
                        }
                    });

                    results = uniqueStudents;
                } else {
                    results = students.filter(student => {
                        const idMatch = student.id && (
                            (queryLength === 8 && student.id.toLowerCase() === query) ||
                            (queryLength < 8 && student.id.toLowerCase().startsWith(query))
                        );
                        const nameMatch = student.name && student.name.toLowerCase().includes(query);
                        const classMatch = student.studentClass && student.studentClass.toString().toLowerCase().includes(query);
                        const schoolMatch = student.school && student.school.toLowerCase().includes(query);
                        const monthMatch = student.month && student.month.toLowerCase().includes(query);

                        return idMatch || nameMatch || classMatch || schoolMatch || monthMatch;
                    });
                }
            }
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error occurred during search.' });
    }
});
//**********************************************   SEARCH END   *****************************************************//




//**********************************************  UPDATE START   *****************************************************//
// Add payment option

app.post('/update', async (req, res) => {
    try {
        const { id, name, studentClass, school, date, month, fee, payment, reactivatestudent } = req.body;

		let updnewvarResult = '----'
		let updnewvarArchiveInd = '-'
		const updnewvarDeletepermanentlyInd = 'X'
		let updnewvarfeenotrequiredInd = 'X'
		const updnewvarFunction = 'UPDATE'
		const updnewvarReactivateIND = reactivatestudent ? 'Y' : 'N';
		const studentInfo = {
		    id: req.body.id,
			updnewvarResult: updnewvarResult,
			updnewvarFunction: updnewvarFunction,
		    name: req.body.name,
		    studentClass: req.body.studentClass,
		    school: req.body.school,
		    date: req.body.date,
		    fee: req.body.fee,
		    month: req.body.month,
		    payment: req.body.payment,
			updnewvarArchiveInd: updnewvarArchiveInd,
			updnewvarDeletepermanentlyInd: updnewvarDeletepermanentlyInd,
			updnewvarfeenotrequiredInd: updnewvarfeenotrequiredInd,
		    updnewvarReactivateIND: updnewvarReactivateIND
		};		
		
		if (studentInfo.payment === 'NA') {
		    studentInfo.updnewvarfeenotrequiredInd = 'Y';
		} else {
		    studentInfo.updnewvarfeenotrequiredInd = 'N';
		}		

        // Log the received reactivatestudent value for debugging
        console.log('studentInfo:', studentInfo);	
        const students = await readDataFile();

        // Convert month names to numeric values for comparison
        const monthToNumber = monthName => {
            const months = ["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
            return months.indexOf(monthName);
        };

        // Convert input month to a numeric value
        const selectedMonthNumber = monthToNumber(month);

        let updatedStudent = null;

        // Loop through each student record
        students.forEach(student => {
            // Check if the student record matches the provided student ID
            if (student.id === id) {
                // Update fields
                if (name !== undefined) {
                    student.name = name;
                }
                if (studentClass !== undefined) {
                    student.studentClass = studentClass;

                    // Update the student ID's first two characters with the class
                    const classCode = studentClass.length === 1 ? `0${studentClass}` : studentClass.substring(0, 2);
                    student.id = `${classCode}${student.id.slice(2)}`;
                }
                if (school !== undefined) {
                    student.school = school;

                    // Update the student ID's 3rd and 4th characters with the school abbreviation
                    const schoolAbbr = getSchoolAbbreviation(school);
                    student.id = `${student.id.slice(0, 2)}${schoolAbbr}${student.id.slice(4)}`;
                }

                if (month !== undefined) {
                    // Update payment if the month matches
                    if (student.month === month) {
                        if (payment !== undefined) {
                            student.payment = payment;
                        }
                    }

                    // Update the student's archiveInd and fee/date if reactivatestudent is true
                    if (reactivatestudent) {
                        if (monthToNumber(student.month) >= selectedMonthNumber) {
                            student.archiveInd = "No"; 
							updnewvarArchiveInd = 'N' 	//FOR HISTORY RECORD
                        }
                        // Update fee and date for current and future months
                        if (monthToNumber(student.month) >= selectedMonthNumber) {
                            if (fee !== undefined) {
                                student.fee = fee;
                            }
                            if (date !== undefined) {
                                student.date = date; // Ensure the date is updated if provided
                            }
                        }
                    } else {
                        // If not reactivating, update the fee and date unconditionally
                        if (fee !== undefined) {
                            student.fee = fee;
                        }
                        if (date !== undefined) {
                            student.date = date; // Ensure the date is updated if provided
                        }
					}
                }

                updatedStudent = student;
            } else if (reactivatestudent && student.id === id) {
                // If reactivatestudent is true and student ID matches, set archiveInd to "No"
                student.archiveInd = "No";
				updnewvarArchiveInd = 'N' 	//FOR HISTORY RECORD
            }
        });

        if (updatedStudent) {
            await writeDataFile(students);

            // Format the student's name
            const nameParts = updatedStudent.name.split(' ');
            const formattedName = nameParts.map((part, index) => 
                index === nameParts.length - 1 ? part.charAt(0).toUpperCase() + part.slice(1).toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
            ).join(' ');
			updnewvarResult = 'PASS';
			await writeToGitHubHistoryFile(studentInfo, updnewvarResult, updnewvarFunction);
            res.json({ message: `Student details updated successfully for - ${formattedName}.` });
        } else {
			updnewvarResult = 'FAIL';
			await writeToGitHubHistoryFile(studentInfo, updnewvarResult, updnewvarFunction);
            res.status(404).json({ message: 'Student record not found or no changes made.' });
        }
    } catch (error) {
		updnewvarResult = 'FAIL';
		await writeToGitHubHistoryFile(studentInfo, updnewvarResult, updnewvarFunction);
        res.status(500).json({ message: 'Error occurred during update.' });
    }
});

async function writeToGitHubHistoryFile(studentInfo, updnewvarResult, updnewvarFunction) {
    const filePath = 'history.txt';
    const commitMessage = 'Update student information'; // Define a commit message

    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    // Convert data to the required formats and padding
    const id = studentInfo.id.padEnd(8, ' ');
    const result = updnewvarResult.padEnd(4, ' ');
    const resultAction = updnewvarFunction.padEnd(7, ' ');
    const formattedName = studentInfo.name.padEnd(18, ' ').substring(0, 18);
    const formattedClass = studentInfo.studentClass.padStart(2, '0').substring(0, 2); // Ensure class is 2 chars long with leading zero if needed
    const formattedSchool = studentInfo.school.padEnd(10, ' ').substring(0, 10);
    const date = studentInfo.date.padEnd(10, ' ').substring(0, 10);
    const formattedFee = studentInfo.fee.toString().padStart(5, ' ').substring(0, 5); // Right-justify formattedFee
    const formattedMonth = studentInfo.month.padEnd(10, ' ').substring(0, 10);
    const formattedPayment = studentInfo.payment.toString().padEnd(1, ' ').substring(0, 1);
    const formattedArchiveInd = studentInfo.updnewvarArchiveInd.padEnd(1, ' ').substring(0, 1);
    const formattedDeletepermanentlyInd = studentInfo.updnewvarDeletepermanentlyInd.padEnd(1, ' ').substring(0, 1);
    const formattedfeenotrequiredInd = studentInfo.updnewvarfeenotrequiredInd.padEnd(1, ' ').substring(0, 1);
    const formattedReactivateIND = studentInfo.updnewvarReactivateIND.padEnd(1, ' ').substring(0, 1);

    // Prepare log entry content
    const content = `${id} ${result} ${resultAction} ${formattedName} ${formattedClass} ${formattedSchool} ${date} ${formattedFee} ${formattedMonth} ${formattedPayment} ${formattedArchiveInd} ${formattedDeletepermanentlyInd} ${formattedfeenotrequiredInd} ${formattedReactivateIND} ${timestamp}\n`;

    try {
        // Get the current content of history.txt
        const { data: { content: currentContent, sha } } = await axios.get(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${filePath}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        // Decode the base64 content and append the new data
        const updatedContent = Buffer.from(currentContent, 'base64').toString('utf-8') + content;
        const encodedContent = Buffer.from(updatedContent).toString('base64');

        // Update the file on GitHub
        await axios.put(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${filePath}`, {
            message: commitMessage,
            content: encodedContent,
            sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
    } catch (error) {
        console.error('Error writing to history file:', error);
    }
}


//**********************************************  UPDATE END     *****************************************************//

//**********************************************  PAYMENT START  *****************************************************//


// Add payment option
app.post('/payment', async (req, res) => {
    try {
        const { id, month, payment, feenotrequired } = req.body;

        // Read data file asynchronously
        const students = await readDataFile();
        
        // Find the index of the student record that matches both id and month
        const index = students.findIndex(student => student.id === id && student.month === month);
        
        if (index !== -1) {
            // Determine PASS/FAIL based on paymentalreadyreceived flag
            const paymenthisvarPaymentStatus = students[index].paymentalreadyreceived ? 'FAIL' : 'PASS';
            // Update the payment status based on feenotrequired
            students[index].payment = feenotrequired ? 'NA' : payment;
            const paymenthisvarFeeNotRequired = feenotrequired ? 'Y' : 'N';

// Prepare log data
const paymenthisvarPayment = payment === 'Yes' ? 'Y' : 'N';
const paymenthisvarArchiveInd = students[index].archiveInd === 'Yes' ? 'Y' : 'N';
const studentClassFormatted = students[index].studentClass.toString().padStart(2, '0');

// Add an extra space before the fee field to push it one place towards the right
const logEntry = `${id} ${paymenthisvarPaymentStatus} PAYMENT ${students[index].name.padEnd(18)} ${studentClassFormatted.padEnd(2)} ${students[index].school.padEnd(10)} ${students[index].date.padEnd(10)} ${' '}${students[index].fee.toString().padEnd(5)}${month.padEnd(10)} ${paymenthisvarPayment.padEnd(1)} ${paymenthisvarArchiveInd.padEnd(1)} X ${paymenthisvarFeeNotRequired} X ${moment().format('YYYY-MM-DD HH:mm:ss')}\n`;


            // Write log data to GitHub history file
            await writeHistoryFileToGitHub(logEntry);

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

async function readDataFile() {
    return new Promise((resolve, reject) => {
        fs.readFile(FILE_PATH, 'utf8', (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

async function writeDataFile(students) {
    return new Promise((resolve, reject) => {
        fs.writeFile(FILE_PATH, JSON.stringify(students, null, 2), 'utf8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

async function writeHistoryFileToGitHub(logEntry) {
    try {
        // Get the current contents of the history file
        const { data: currentData } = await axios.get(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${historyFilePath}`, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3.raw'
            }
        });

        // Append the new log entry to the current content
        const updatedContent = currentData + logEntry;

        // Get the current SHA of the file
        const { data: fileData } = await axios.get(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${historyFilePath}`, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`
            }
        });

        const sha = fileData.sha;

        // Prepare the commit data
        const commitData = {
            message: 'Update history file',
            content: Buffer.from(updatedContent).toString('base64'),
            sha
        };

        // Commit the updated content to the GitHub repository
        await axios.put(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${historyFilePath}`, commitData, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
            }
        });
    } catch (error) {
        console.error('Error writing to GitHub:', error);
        throw error;
    }
}



//**********************************************  PAYMENT ENDS   *****************************************************//





//**********************************************  EXIT  START    *****************************************************//
app.post('/exit', async (req, res) => {
    const { id, month, deletepermanently } = req.body;
	const studentInfo = {
	    id: req.body.id,
	    name: req.body.name,
	    studentClass: req.body.studentClass,
	    school: req.body.school,
	    date: req.body.date,
	    fee: req.body.fee,
	    month: req.body.month,
	    payment: req.body.payment,
	    archiveInd: req.body.archiveInd
	};


    try {
        // Read data file asynchronously
        const students = await readDataFile();

        let studentData = students.find(student => student.id === id);

        if (deletepermanently === true) {
            // Delete records with the given ID
            const remainingStudents = students.filter(student => student.id !== id);

            // Write the updated data back to the file
            await writeDataFile(remainingStudents);

            // Log the deletion

            await writeExitLog(studentInfo,{
                id,
                name: studentData?.name || 'N/A',
                studentClass: studentData?.studentClass || 'N/A',
                school: studentData?.school || 'N/A',
                date: studentData?.date || 'N/A',
                fee: studentData?.fee || 'N/A',
                month: month || 'N/A',
                payment: studentData?.payment || 'N/A',
                archiveInd: studentData?.archiveInd || 'N/A'
            }, 'delete', deletepermanently, false);


            return res.json({ message: 'Student record(s) deleted permanently.' });
        }

        // If deletepermanently is not true, perform existing logic to archive
        const months = getMonthsUntilMarch(month);

        let updated = false;
        let studentAlreadyInactive = false;

        students.forEach(student => {
            if (student.id === id && months.includes(student.month)) {
                if (student.archiveInd === 'Yes') {
                    studentAlreadyInactive = true;
                } else {
                    student.archiveInd = 'Yes';
                    updated = true;
                    studentData = student; // Get student data for logging
                }
            }
        });

        if (studentAlreadyInactive) {
            await writeExitLog(studentInfo, studentData || {
                id,
                name: 'N/A',
                studentClass: 'N/A',
                school: 'N/A',
                date: 'N/A',
                fee: 'N/A',
                month: month || 'N/A',
                payment: 'N/A',
                archiveInd: 'Yes'
            }, 'archive', deletepermanently, studentAlreadyInactive);

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

            const formattedName = formatName(studentData.name);

            // Write to history.txt log
            await writeExitLog(studentInfo, studentData, 'archive', deletepermanently, studentAlreadyInactive);

            res.json({ message: `Student ${formattedName} has been marked as inactive.` });
        } else {
            await writeExitLog(studentInfo, studentData || {
                id,
                name: 'N/A',
                studentClass: 'N/A',
                school: 'N/A',
                date: 'N/A',
                fee: 'N/A',
                month: month || 'N/A',
                payment: 'N/A',
                archiveInd: 'No'
            }, 'archive', deletepermanently, studentAlreadyInactive);

            res.status(404).json({ message: 'Oops, student record not found or no records to update.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error occurred while processing the request.' });
    }
});



// Function to write logs to history.txt
const writeExitLog = async (studentInfo, studentData, action, deletePermanently, studentAlreadyInactive) => {
    const historyFilePath = 'history.txt';
    const commitMessage = 'Update history file';

    // Extract and format data fields
    const {
        id1,
        name1,
        studentClass1,
        school1,
        date1,
        fee1,
        month1,
        payment1,
        archiveInd
    } = studentData;

    const {
        id,
        name,
        studentClass,
        school,
        date,
        fee,
        month,
        payment
    } = studentInfo;
	


    const formattedName = name.padEnd(18, ' ').substring(0, 18);
    const formattedClass = studentClass.toString().padStart(2, '0').substring(0, 2);
    const formattedSchool = school.padEnd(10, ' ').substring(0, 10);
    const formattedFee = fee.toString().padStart(5, ' ').substring(0, 5);
    const formattedMonth = month.padEnd(10, ' ').substring(0, 10);
    const formattedPayment = payment.substring(0, 1);
    let  formattedArchiveInd = archiveInd.substring(0, 1);
    const deleteFlag = deletePermanently ? 'Y' : 'N';
    const resultAction = action === 'delete' ? 'DELETE ' : 'ARCHIVE';



    // Determine result based on studentAlreadyInactive and file modification
    const result = studentAlreadyInactive ? 'FAIL' : 'PASS';
	if (result === 'FAIL' && resultAction === 'ARCHIVE') {
    formattedArchiveInd = 'Y';}
     
	if (deleteFlag === 'Y') {
    formattedArchiveInd = '-';};

    // Get current timestamp in IST (+05:30) format
    const now = new Date();
    const utcOffset = 330; // IST is UTC+05:30 which is 330 minutes
    const istDate = new Date(now.getTime() + utcOffset * 60 * 1000);
    const timestamp = istDate.toISOString().replace('T', ' ').substring(0, 19); // Example format: 2024-08-17 20:00:00

    // Prepare log entry content with timestamp
    const content = `${id} ${result} ${resultAction} ${formattedName} ${formattedClass} ${formattedSchool} ${date} ${formattedFee} ${formattedMonth} ${formattedPayment} ${formattedArchiveInd} ${deleteFlag} X X ${timestamp}\n`;

    try {
        // Get the current content of history.txt
        const { data: { content: currentContent, sha } } = await axios.get(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${historyFilePath}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        // Decode the base64 content and append the new data
        const updatedContent = Buffer.from(currentContent, 'base64').toString('utf-8') + content;
        const encodedContent = Buffer.from(updatedContent).toString('base64');

        // Update the file on GitHub
        await axios.put(`${GITHUB_API_BASE}/repos/${GITHUB_REPO}/contents/${historyFilePath}`, {
            message: commitMessage,
            content: encodedContent,
            sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
    } catch (error) {
        console.error('Error writing to history file:', error);
    }
};
//**********************************************  EXIT   END   *****************************************************//



app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
