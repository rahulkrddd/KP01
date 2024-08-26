const express = require('express');
const router = express.Router();
const axios = require('axios');

const GITHUB_REPO = 'rahulkrddd/KP01';
const FILE_PATH = 'students.txt';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

router.post('/', async (req, res) => {
    const { mobile, name } = req.body; // Exclude timestamp from request
    console.log('Received request:', { mobile, name }); // Debugging message

    try {
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

        // Find the student with the provided mobile number and name matching the first 3 characters (case-insensitive)
        const searchName = name.toLowerCase().slice(0, 3); // Get the first 3 characters of the name in lowercase
        const student = students.find(s => s.mobile === mobile && s.name.toLowerCase().startsWith(searchName));

        if (student) {
            // Add the existing student's timestamp to the response
            res.status(200).json({ ...student });
        } else {
            res.status(404).json({ error: "Student not found, Retry or contact 'Knowledge Point'." });
        }
    } catch (error) {
        console.error('Server error:', error); // Debugging message
        res.status(500).json({ error: 'Failed to fetch student status.' });
    }
});

router.put('/', async (req, res) => {
    const { mobile, name, timestamp, email, ...updates } = req.body;
    console.log('Received update request:', { mobile, name, timestamp, email, updates });

    try {
        // Get the current content of the students.txt file from GitHub
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
                response = { data: { content: '', sha: null } };
            } else {
                throw error;
            }
        }

        const fileContent = response.data.content ? Buffer.from(response.data.content, 'base64').toString('utf8') : '[]';
        const students = JSON.parse(fileContent);

        // Check for duplicate mobile number and email
        const duplicateMobile = students.find(s => s.mobile === mobile && s.timestamp !== timestamp);
        const duplicateEmail = students.find(s => s.email === email && s.timestamp !== timestamp);

        if (duplicateMobile) {
            return res.status(400).json({ error: 'This mobile number is already registered.' });
        }

        if (duplicateEmail) {
            return res.status(400).json({ error: 'This email ID is already registered.' });
        }

        // Find the student with the provided timestamp
        const studentIndex = students.findIndex(s => s.timestamp === timestamp);

        if (studentIndex !== -1) {
            const existingStudent = students[studentIndex];

            // Update the student record with the new mobile, name, email, and other updates
            const updatedStudent = {
                ...existingStudent,
                mobile: mobile || existingStudent.mobile,
                name: name || existingStudent.name,
                email: email || existingStudent.email,
                ...updates
            };

            // Preserve the original timestamp
            students[studentIndex] = { ...updatedStudent, timestamp: existingStudent.timestamp };

            // Save updated content to GitHub
            const updatedContent = Buffer.from(JSON.stringify(students, null, 2)).toString('base64');
            const updateResponse = await axios.put(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
                message: 'Update student record',
                content: updatedContent,
                sha: response.data.sha
            }, {
                headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: 'application/vnd.github.v3+json'
                }
            });

            if (updateResponse.status === 200) {
                res.status(200).json({ message: 'Student record updated successfully.' });
            } else {
                console.error('GitHub API response:', updateResponse.data);
                res.status(500).json({ error: 'Failed to update student record.' });
            }
        } else {
            res.status(404).json({ error: 'Student not found, Retry or contact Knowledge Point.' });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Failed to update student record.' });
    }
});

module.exports = router;
