const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/update', async (req, res) => {
    const { content } = req.body;

    const GITHUB_REPO = 'rahulkrddd/KP01';
    const FILE_PATH = 'data0.txt';
    const GITHUB_TOKEN = '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';

    try {
        // Dynamically import node-fetch
        const fetch = await import('node-fetch').then(mod => mod.default);

        // Get the SHA of the existing file
        const getFileResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!getFileResponse.ok) {
            const errorData = await getFileResponse.json();
            return res.status(getFileResponse.status).json({ message: 'Failed to get file', error: errorData });
        }

        const fileData = await getFileResponse.json();
        const sha = fileData.sha;

        // Update the file content
        const updateFileResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update data0.txt',
                content: Buffer.from(content).toString('base64'),
                sha
            })
        });

        if (updateFileResponse.ok) {
            res.json({ message: 'File updated successfully' });
        } else {
            const errorData = await updateFileResponse.json();
            res.status(500).json({ message: 'Failed to update file', error: errorData });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
