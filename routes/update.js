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

// Route to handle update student details
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
      <form action="/update_record" method="post">
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
      <form action="/update_record" method="post">
        <input type="hidden" name="studentId" value="${student.id}">
        <label>Name: <input type="text" name="name" value="${student.name}" required></label><br>
        <label>Class: <input type="number" name="class" value="${student.class}" required></label><br>
        <label>School: <input type="text" name="school" value="${student.school}" required></label><br>
        <label>Enroll Date: <input type="date" name="enrollDate" value="${student.enrollDate}" required></label><br>
        <label>Fee Amount: <input type="number" name="feeAmount" value="${student.feeAmount}" required></label><br>
        <label>Month: <input type="text" name="month" value="${student.month}" required></label><br>
        <label>Payment Received: <select name="paymentReceived">
          <option value="Yes" ${student.paymentReceived === 'Yes' ? 'selected' : ''}>Yes</option>
          <option value="No" ${student.paymentReceived === 'No' ? 'selected' : ''}>No</option>
        </select></label><br>
        <button type="submit">Update</button>
      </form>
    `);
  }
});

// Route to handle updating a record
router.post('/update_record', (req, res) => {
  const { studentId, name, class: studentClass, school, enrollDate, feeAmount, month, paymentReceived } = req.body;
  let students = readData();
  students = students.map(student => {
    if (student.id === studentId) {
      return { ...student, name, class: studentClass, school, enrollDate, feeAmount, month, paymentReceived };
    }
    return student;
  });
  writeData(students);
  res.send('Student details updated successfully');
});

module.exports = router;
