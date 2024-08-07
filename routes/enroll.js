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

// Route to handle enroll new student
router.post('/', (req, res) => {
  const { name, class: studentClass, school, enrollDate, feeAmount, month, paymentReceived } = req.body;
  const students = readData();
  const newId = `STU${Date.now()}`;
  students.push({ id: newId, name, class: studentClass, school, enrollDate, feeAmount, month, paymentReceived, archiveInd: 'N' });
  writeData(students);
  res.send(`Student enrolled successfully with ID: ${newId}`);
});

module.exports = router;
