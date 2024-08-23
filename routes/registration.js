const express = require('express');
const router = express.Router();
const axios = require('axios');

const GITHUB_REPO = 'rahulkrddd/KP01';
const FILE_PATH = 'students.txt';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

router.post('/', async (req, res) => {
    const studentData = req.body;

    try {
        // Ensure 'status' is set to 'pending' if not provided
        if (!studentData.status) {
            studentData.status = 'pending';
        }

        // Get the current content of the students.txt file
        let response;
        try {
            response = await axios.get(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
                headers: {
                    Authorization: `token ${GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            });
        } catch (error) {
            if (error.response && error.response.status === 404) {
                // File not found, initialize an empty array
                response = {
                    data: {
                        content: '',
                        sha: null
                    }
                };
            } else {
                throw error;
            }
        }

        const fileContent = response.data.content ? Buffer.from(response.data.content, 'base64').toString('utf8') : '[]';
        const students = JSON.parse(fileContent);

        // Check for duplicate mobile number or email ID
        const duplicateMobile = students.find(student => student.mobile === studentData.mobile);
        const duplicateEmail = students.find(student => student.email === studentData.email);

        if (duplicateMobile) {
            return res.status(400).json({ error: 'This mobile number is already registered' });
        }
        if (duplicateEmail) {
            return res.status(400).json({ error: 'This email ID is already registered' });
        }

        // Add the new student data
        students.push(studentData);

        // Update the file on GitHub
        const updatedContent = Buffer.from(JSON.stringify(students, null, 2)).toString('base64');
        await axios.put(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            message: `Add new student: ${studentData.name}`,
            content: updatedContent,
            sha: response.data.sha // null if file didn't exist
        }, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`
            }
        });

        res.status(200).json({ message: 'Student registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to register student' });
    }
});

module.exports = router;
