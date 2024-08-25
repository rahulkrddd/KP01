// routes/studentpayment.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

const GITHUB_REPO = 'rahulkrddd/KP01';
const FILE_PATH = 'data.txt';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_API_URL = 'https://api.github.com';




router.post('/check-payment', async (req, res) => {
    try {
        // Extract data from request body
        const { name, mobile, studentId } = req.body;

        // Fetch the JSON file from GitHub
        const response = await axios.get(`${GITHUB_API_URL}/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`
            }
        });

        // Decode the base64 content
        const jsonContent = Buffer.from(response.data.content, 'base64').toString('utf8');
        
        // Parse the JSON content
        const records = JSON.parse(jsonContent);
        
        // Convert search criteria to lowercase for case-insensitive comparison
        const searchNameStart = name.slice(0, 3).toLowerCase();
        const searchMobile = mobile;
        const searchStudentId = studentId.toLowerCase();

        // Filter for matching records
        const matchingRecords = records.filter(record => 
            record.mobile === searchMobile &&
            record.id.toLowerCase() === searchStudentId &&
            record.name.toLowerCase().startsWith(searchNameStart)
        );

        // Log the search criteria and the results
        console.log('Searching for records with:', { name, mobile, studentId });
        if (matchingRecords.length > 0) {
            console.log('Matching records found:', matchingRecords);
            res.json(matchingRecords);
        } else {
            console.log('No records found for:', { name, mobile, studentId });
            res.status(404).json({ message: 'You are not registered or incorrect details entered, Pls try again.' });
        }
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports = router;
