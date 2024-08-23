const express = require('express');
const router = express.Router();
const axios = require('axios');

const GITHUB_REPO = 'rahulkrddd/KP01';
const FILE_PATH = 'students.txt';
const DATA_FILE_PATH = 'data.txt';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API_URL = 'https://api.github.com';

// Fetch records from GitHub
router.get('/records', async (req, res) => {
    try {
        const response = await axios.get(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        // Decode base64 content
        const fileContent = Buffer.from(response.data.content, 'base64').toString('utf-8');
        const records = JSON.parse(fileContent);

        res.json(records);
    } catch (error) {
        console.error('Error fetching records:', error);
        res.status(500).send('Error fetching records');
    }
});

// Define your routes here
router.post('/validate-password', (req, res) => {
    console.log('Endpoint /validate-password hit');
    const { password } = req.body;
    const validPassword = process.env.PASSWORD;

    console.log('Received password:', password);
    console.log('Valid password from environment:', validPassword);

    if (password === validPassword) {
        console.log('Password is valid');
        res.json({ valid: true });
    } else {
        console.log('Password is invalid');
        res.json({ valid: false });
    }
});


// Decline selected records
router.post('/decline', async (req, res) => {
    console.log('Received request to decline records:', req.body);
    const { timestamps } = req.body;

    try {
        // Fetch the current records
        const fileResponse = await axios.get(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        // Decode base64 content
        const fileContent = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');
        const records = JSON.parse(fileContent);

        // Update the status of selected records
        const updatedRecords = records.map(record => {
            if (timestamps.includes(record.timestamp) && record.status === 'Pending') {
                console.log(`Declining record: ${record.timestamp}`);
                record.status = 'Declined';
            }
            return record;
        });

        // Convert updated records to JSON and encode to base64
        const updatedContent = Buffer.from(JSON.stringify(updatedRecords, null, 2)).toString('base64');

        // Update the file on GitHub
        await axios.put(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            message: 'Update student records',
            content: updatedContent,
            sha: fileResponse.data.sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        res.json({ message: 'Records declined successfully', updatedRecords });
    } catch (error) {
        console.error('Error declining records:', error);
        res.status(500).send('Error declining records');
    }
});

// Delete selected records
router.post('/delete', async (req, res) => {
    console.log('Received request to delete records:', req.body);
    const { timestamps } = req.body;

    try {
        // Fetch the current records
        const fileResponse = await axios.get(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        // Decode base64 content
        const fileContent = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');
        let records = JSON.parse(fileContent);

        // Remove the selected records
        const deletedRecords = records.filter(record => timestamps.includes(record.timestamp));
        records = records.filter(record => !timestamps.includes(record.timestamp));

        // Convert updated records to JSON and encode to base64
        const updatedContent = Buffer.from(JSON.stringify(records, null, 2)).toString('base64');

        // Update the file on GitHub
        await axios.put(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            message: 'Update student records',
            content: updatedContent,
            sha: fileResponse.data.sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        res.json({ message: 'Records deleted successfully', deletedRecords });
    } catch (error) {
        console.error('Error deleting records:', error);
        res.status(500).send('Error deleting records');
    }
});


const crypto = require('crypto');
const moment = require('moment'); // Make sure to install moment.js if not already done

// Helper function to generate unique IDs
function generateUniqueId(studentClass, schoolCode) {
    const randomKey = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${studentClass.padStart(2, '0')}${schoolCode}${randomKey}`;
}

// Helper function to get school abbreviation
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

// Helper function to generate records for each month
function generateRecordsForMonths(record, startMonth, endMonth) {
    const records = [];
    const months = moment.monthsShort();

    for (let month = moment(startMonth, 'MMMM').month(); month <= moment(endMonth, 'MMMM').month(); month++) {
        const recordCopy = { ...record };
        recordCopy.id = generateUniqueId(record.studentClass, getSchoolAbbreviation(record.school));
        recordCopy.date = moment().format('YYYY-MM-DD');
        recordCopy.month = months[month];
        recordCopy.fee = '1000';
        recordCopy.payment = 'No';
        recordCopy.archiveInd = 'No';

        records.push(recordCopy);
    }

    return records;
}



// Helper function to generate a random alphanumeric key
function generateRandomKey(length = 4) {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}

// Helper function to get the school abbreviation
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

// Function to write records to data.txt
// Function to write records to data.txt
async function writeToDataFile(approvedRecords) {
    try {
        // Fetch the current data.txt file
        const dataFileResponse = await axios.get(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        // Decode base64 content
        const dataFileContent = Buffer.from(dataFileResponse.data.content, 'base64').toString('utf-8');
        const existingRecords = JSON.parse(dataFileContent);

        // Get current date and determine the current financial year
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth(); // 0-based index
        const currentYear = currentDate.getFullYear();
        const financialYearStartMonth = 2; // March
        const financialYearEndMonth = 2; // March

        // Calculate months range to include until March of next year
        let months = [];
        for (let i = currentMonth; i <= 11; i++) {
            months.push(new Date(currentYear, i, 1).toLocaleString('default', { month: 'long' }));
        }
        for (let i = 0; i <= financialYearEndMonth; i++) {
            months.push(new Date(currentYear + 1, i, 1).toLocaleString('default', { month: 'long' }));
        }

        // Create new records for each month in the range
        const newRecords = approvedRecords.flatMap(record => {
            // Check if necessary fields exist
            if (!record.class || !record.school || !record.name || !record.mobile || !record.email || !record.Address) {
                console.warn('Skipping record due to missing data:', record);
                return [];
            }

            const studentClass = record.class.padStart(2, '0');
            const schoolCode = getSchoolAbbreviation(record.school);
            const randomKey = generateRandomKey(); // Ensure this generates a unique key for ID
            const id = `${studentClass}${schoolCode}${randomKey}`;

            return months.map(month => ({
                id: id, // Keep the same ID for all months
                name: record.name,
                studentClass: studentClass,
                school: record.school,
                date: currentDate.toISOString().split('T')[0],
                fee: '1000',
                month: month,
                payment: 'No',
                mobile: record.mobile,
                emailid: record.email,
                address: record.Address, // Use the correct field name
                archiveInd: 'No'
            }));
        }).filter(record => record !== null); // Filter out null values

        // Append new records to existing records
        const updatedDataRecords = [...existingRecords, ...newRecords];

        // Convert updated records to JSON and encode to base64
        const updatedDataContent = Buffer.from(JSON.stringify(updatedDataRecords, null, 2)).toString('base64');

        // Update the file on GitHub
        await axios.put(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${DATA_FILE_PATH}`, {
            message: 'Add approved records to data.txt',
            content: updatedDataContent,
            sha: dataFileResponse.data.sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });
    } catch (error) {
        console.error('Error writing data records:', error);
        throw new Error('Error writing data records');
    }
}


// Approve selected records
router.post('/approve', async (req, res) => {
    console.log('Received request to approve records:', req.body);
    const { timestamps } = req.body;

    try {
        // Fetch the current records
        const fileResponse = await axios.get(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        // Decode base64 content
        const fileContent = Buffer.from(fileResponse.data.content, 'base64').toString('utf-8');
        const records = JSON.parse(fileContent);

        // Update the status of selected records
        const updatedRecords = records.map(record => {
            if (timestamps.includes(record.timestamp) && record.status === 'Pending') {
                record.status = 'Approved';
            }
            return record;
        });

        // Convert updated records to JSON and encode to base64
        const updatedContent = Buffer.from(JSON.stringify(updatedRecords, null, 2)).toString('base64');

        // Update the file on GitHub
        await axios.put(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            message: 'Update student records',
            content: updatedContent,
            sha: fileResponse.data.sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        // Write the approved records to data.txt
        const approvedRecords = updatedRecords.filter(record => timestamps.includes(record.timestamp) && record.status === 'Approved');
        await writeToDataFile(approvedRecords);

        res.json({ message: 'Records updated successfully', updatedRecords });
    } catch (error) {
        console.error('Error updating records:', error);
        res.status(500).send('Error updating records');
    }
});



router.post('/clear', async (req, res) => {
    try {
        // Fetch the current file details
        const fileResponse = await axios.get(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        // Set the file content to an empty array and encode it to base64
        const updatedContent = Buffer.from(JSON.stringify([], null, 2)).toString('base64');

        // Update the file on GitHub with the empty content
        await axios.put(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            message: 'Clear all student records',
            content: updatedContent,
            sha: fileResponse.data.sha
        }, {
            headers: { Authorization: `token ${GITHUB_TOKEN}` }
        });

        res.json({ message: 'All records cleared successfully' });
    } catch (error) {
        console.error('Error clearing records:', error);
        res.status(500).send('Error clearing records');
    }
});



module.exports = router;
