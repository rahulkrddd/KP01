const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const filePath = path.join(__dirname, 'data.txt');

// Helper function to read data from file
function readData() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]'); // Initialize as empty array
  }
  const data = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(data);
}

// Helper function to write data to file
function writeData(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Serve HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle enroll new student
app.post('/enroll', (req, res) => {
  const { name, class: studentClass, school, enrollDate, feeAmount, month, paymentReceived } = req.body;
  const students = readData();
  const newId = `STU${Date.now()}`;
  students.push({ id: newId, name, class: studentClass, school, enrollDate, feeAmount, month, paymentReceived, archiveInd: 'N' });
  writeData(students);
  res.send(`Student enrolled successfully with ID: ${newId}`);
});

// Route to handle update student details
app.post('/update', (req, res) => {
  const { name, class: studentClass, school } = req.body;
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
        <label>Archive Ind: <input type="text" name="archiveInd" value="${student.archiveInd}" readonly></label><br>
        <button type="submit">Update</button>
      </form>
    `);
  }
});

// Route to handle individual student record updates
app.post('/update_record', (req, res) => {
  const { studentId, name, class: studentClass, school, enrollDate, feeAmount, month, paymentReceived } = req.body;
  const students = readData();
  const studentIndex = students.findIndex(student => student.id === studentId);
  
  if (studentIndex === -1) {
    return res.send('Student not found');
  }

  students[studentIndex] = {
    ...students[studentIndex],
    name,
    class: studentClass,
    school,
    enrollDate,
    feeAmount,
    month,
    paymentReceived
  };

  writeData(students);
  res.send('Student details updated successfully');
});

// Route to handle add payment option
app.post('/add_payment', (req, res) => {
  const { name, class: studentClass, school } = req.body;
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
      <form action="/update_payment" method="post">
        <table>
          <thead>
            <tr><th>Select</th><th>ID</th><th>Name</th><th>Class</th><th>School</th><th>Payment Received</th></tr>
          </thead>
          <tbody>
            ${filteredStudents.map((student) => `
              <tr>
                <td><input type="radio" name="studentId" value="${student.id}" required></td>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.class}</td>
                <td>${student.school}</td>
                <td>${student.paymentReceived}</td>
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
      <form action="/update_payment" method="post">
        <input type="hidden" name="studentId" value="${student.id}">
        <label>Payment Received: <select name="paymentReceived">
          <option value="Yes" ${student.paymentReceived === 'Yes' ? 'selected' : ''}>Yes</option>
          <option value="No" ${student.paymentReceived === 'No' ? 'selected' : ''}>No</option>
        </select></label><br>
        <button type="submit">Update</button>
      </form>
    `);
  }
});

// Route to handle individual payment updates
app.post('/update_payment', (req, res) => {
  const { studentId, paymentReceived } = req.body;
  const students = readData();
  const studentIndex = students.findIndex(student => student.id === studentId);
  
  if (studentIndex === -1) {
    return res.send('Student not found');
  }

  students[studentIndex].paymentReceived = paymentReceived;

  writeData(students);
  res.send('Payment option updated successfully');
});

// Route to handle exit student
app.post('/exit_student', (req, res) => {
  const { name, class: studentClass, school } = req.body;
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
      <form action="/update_exit" method="post">
        <table>
          <thead>
            <tr><th>Select</th><th>ID</th><th>Name</th><th>Class</th><th>School</th><th>Archive Ind</th></tr>
          </thead>
          <tbody>
            ${filteredStudents.map((student) => `
              <tr>
                <td><input type="radio" name="studentId" value="${student.id}" required></td>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.class}</td>
                <td>${student.school}</td>
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
      <form action="/update_exit" method="post">
        <input type="hidden" name="studentId" value="${student.id}">
        <label>Archive Ind: <input type="text" name="archiveInd" value="${student.archiveInd}" readonly></label><br>
        <button type="submit">Exit</button>
      </form>
    `);
  }
});

// Route to handle individual exit updates
app.post('/update_exit', (req, res) => {
  const { studentId } = req.body;
  const students = readData();
  const studentIndex = students.findIndex(student => student.id === studentId);
  
  if (studentIndex === -1) {
    return res.send('Student not found');
  }

  if (students[studentIndex].archiveInd === 'Y') {
    return res.send('Student is already removed');
  }

  students[studentIndex].archiveInd = 'Y';

  writeData(students);
  res.send('Student exited successfully');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
