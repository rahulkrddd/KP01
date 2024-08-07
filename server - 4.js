const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

let students = [];

// Load existing students from a file
function loadStudents() {
    try {
        const data = fs.readFileSync('students.json');
        students = JSON.parse(data);
    } catch (error) {
        students = [];
    }
}

// Save students to a file
function saveStudents() {
    fs.writeFileSync('students.json', JSON.stringify(students));
}

app.post('/enroll', (req, res) => {
    const { name, studentClass, school, date, fee, month, payment } = req.body;
    if (!name || !studentClass || !school || !date || !fee || !month || !payment) {
        return res.json({ message: 'All fields are required' });
    }

    students.push({ name, class: studentClass, school, date, fee, month, payment });
    saveStudents();
    res.json({ message: 'Student enrolled successfully' });
});

app.get('/search', (req, res) => {
    const query = req.query.query.toLowerCase();
    const results = students.filter(student =>
        student.name.toLowerCase().includes(query) ||
        student.class.toLowerCase().includes(query) ||
        student.school.toLowerCase().includes(query)
    );
    res.json(results);
});

app.listen(port, () => {
    loadStudents();
    console.log(`Server running at http://localhost:${port}`);
});
