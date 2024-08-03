const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const dataFile = path.join(__dirname, 'data.txt');
if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '');
}

function generateStudentID(studentClass) {
    return `${studentClass}-${Date.now()}`;
}

app.post('/enroll', (req, res) => {
    const data = req.body;
    const id = generateStudentID(data.class);
    const record = `${id}|${data.name}|${data.class}|${data.school}|${data.enrollDate}|${data.feeAmount}|${data.month}|${data.paymentReceived}|No\n`;
    fs.appendFileSync(dataFile, record);
    res.json({ message: `Student enrolled successfully with ID: ${id}` });
});

app.get('/search', (req, res) => {
    const query = req.query.query.toLowerCase();
    const records = fs.readFileSync(dataFile, 'utf8').split('\n');
    const results = records.filter(record => record.toLowerCase().includes(query));
    let html = '<ul>';
    results.forEach(record => {
        const fields = record.split('|');
        html += `<li>ID: ${fields[0]}, Name: ${fields[1]}, Class: ${fields[2]}, School: ${fields[3]}, Enroll Date: ${fields[4]}, Fee Amount: ${fields[5]}, Month: ${fields[6]}, Payment Received: ${fields[7]}</li>`;
    });
    html += '</ul>';
    res.json({ html });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
