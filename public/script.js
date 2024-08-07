function showSection(sectionId) {
    document.querySelectorAll('main section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

async function enrollStudent() {
    const form = document.getElementById('enroll-form');
    const data = new FormData(form);
    const response = await fetch('/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data))
    });
    const result = await response.json();
    alert(result.message);
}

async function searchStudents() {
    const query = document.getElementById('search-query').value;
    const response = await fetch(`/search?query=${query}`);
    const results = await response.json();
    
    const resultsDiv = document.getElementById('search-results');
    resultsDiv.innerHTML = '';
    
    if (results.length === 0) {
        resultsDiv.innerHTML = '<p>No record found</p>';
        return;
    }

    results.forEach(student => {
        resultsDiv.innerHTML += `
            <div>
                <p>ID: ${student.id}</p>
                <p>Name: ${student.name}</p>
                <p>Class: ${student.class}</p>
                <p>School: ${student.school}</p>
                <p>Fee Amount: ${student.feeAmount}</p>
                <p>Enroll Date: ${student.enrollDate}</p>
                <p>Payment Received: ${student.paymentReceived}</p>
                <p>Archive Status: ${student.archiveInd}</p>
            </div>
        `;
    });
}

async function updateStudent() {
    const form = document.getElementById('update-form');
    const data = new FormData(form);
    const response = await fetch('/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data))
    });
    const result = await response.json();
    alert(result.message);
}

async function addPaymentOption() {
    const form = document.getElementById('payment-form');
    const data = new FormData(form);
    const response = await fetch('/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data))
    });
    const result = await response.json();
    alert(result.message);
}

async function exitStudent() {
    const form = document.getElementById('exit-form');
    const data = new FormData(form);
    const response = await fetch('/exit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(data))
    });
    const result = await response.json();
    alert(result.message);
}
