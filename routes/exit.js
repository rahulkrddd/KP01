const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data.txt');

// Helper functions
function readData() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '');
  }
  const data = fs.readFileSync(filePath, 'utf8');
  return data ? JSON.parse(data) : [];
}

function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Route to handle exit student
router.post('/', (req, res) => {
  const { search, name, class: studentClass, school } = req.body;
  const students = readData();
  let filteredStudents = students.filter(student =>
    (name && student.name === name) ||
    (studentClass && student.class === studentClass) ||
    (school && student.school === school)
  );

  if (filteredStudents.length === 0) {
    return res.send('No record found');
  }

  if (filteredStudents.length > 1) {
    return res.send(`
      <form action="/exit_student_record" method="post">
        <table>
          <thead>
            <tr><th>Select</th><th>ID</th><th>Name</th><th>Class</th><th>School</th><th>Enroll Date</th><th>Fee Amount</th><th>Month</th><th>Payment Received</th><th>Archive Ind</th></tr>
          </thead>
          <tbody>
            ${filteredStudents.map((student) => `
              <tr>
                <td><input type="radio" name="studentId" value="${student.id}" required></td>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.class}</td>
                <td>${student.school}</td>
                <td>${student.enrollDate}</td>
                <td>${student.feeAmount}</td>
                <td>${student.month}</td>
                <td>${student.paymentReceived}</td>
                <td>${student.archiveInd}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <button type="submit">Select</button>
      </form>
    `);
  } else {
    const student = filteredStudents[0];
    return res.send(`
      <form action="/exit_student_record" method="post">
        <input type="hidden" name="studentId" value="${student.id}">
        <p>Are you sure you want to exit this student?</p>
        <p>Current Archive Ind: ${student.archiveInd}</p>
        <button type="submit">Confirm Exit</button>
      </form>
    `);
  }
});

// Route to handle exiting a student
router.post('/exit_student_record', (req, res) => {
  const { studentId } = req.body;
  let students = readData();
  students = students.map(student => {
    if (student.id === studentId) {
      if (student.archiveInd === 'Y') {
        return res.send('Student is already removed');
      }
      return { ...student, archiveInd: 'Y' };
    }
    return student;
  });
  writeData(students);
  res.send('Student exited successfully');
});

module.exports = router;
