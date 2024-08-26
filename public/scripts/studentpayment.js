document.getElementById('stpayForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    clearPreviousResults();

    const name = document.getElementById('stpayName').value;
    const mobile = document.getElementById('stpayMobile').value;
    const studentId = document.getElementById('stpayId').value;

    try {
        const data = await fetchPaymentData(name, mobile, studentId);
        handleResponse(data);
    } catch (error) {
        handleError(error);
    }
});

function clearPreviousResults() {
    document.getElementById('stpayError').innerText = '';
    document.getElementById('stpayResults').style.display = 'none';
    document.getElementById('stpayStudentInfo').getElementsByTagName('tbody')[0].innerHTML = '';
    document.getElementById('stpayPaymentInfo').getElementsByTagName('tbody')[0].innerHTML = '';
}

async function fetchPaymentData(name, mobile, studentId) {
    const response = await fetch('/studentpayment/check-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, mobile, studentId })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response was not ok');
    }

    return response.json();
}

function handleResponse(data) {
    if (data.length === 0) {
        document.getElementById('stpayError').innerText = 'No records found';
    } else {
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        const currentMonthRecord = data.find(record => record.month === currentMonth);

        if (currentMonthRecord) {
            document.getElementById('stpayResults').style.display = 'block';
            displayStudentInfo(currentMonthRecord);
            displayPaymentInfo(data);
        } else {
            document.getElementById('stpayError').innerText = `No records found for the current month (${currentMonth})`;
        }
    }
}

function displayStudentInfo(record) {
    const studentInfoBody = document.getElementById('stpayStudentInfo').getElementsByTagName('tbody')[0];
    studentInfoBody.innerHTML = 
    `<tr>
        <td style="font-weight: 549; ${window.innerWidth <= 768 ? 'display: block;' : ''}"> ${window.innerWidth <= 768 ? 'Name           : ' : ''}${record.name} </td>
        <td style="font-weight: 549; ${window.innerWidth <= 768 ? 'display: block;' : ''}"> ${window.innerWidth <= 768 ? 'Student ID     : ' : ''}${record.id} </td>
        <td style="font-weight: 549; ${window.innerWidth <= 768 ? 'display: block;' : ''}"> ${window.innerWidth <= 768 ? 'Class          : ' : ''}${record.studentClass} </td>
        <td style="font-weight: 549; ${window.innerWidth <= 768 ? 'display: block;' : ''}"> ${window.innerWidth <= 768 ? 'School         : ' : ''}${record.school} </td>
        <td style="font-weight: 549; ${window.innerWidth <= 768 ? 'display: block;' : ''}"> ${window.innerWidth <= 768 ? 'Enroll Date    : ' : ''}${record.date} </td>
		<td style="background-color: ${record.archiveInd === 'Yes' ? 'Red' : 'lightgreen'};    font-weight: 549;    ${window.innerWidth <= 768 ? 'display: block;' : ''} "> ${window.innerWidth <= 768 ? 'Status         : ' : ''}${record.archiveInd === 'No' ? 'Active' : 'Inactive'} </td>                                                                                                                                              
	 </tr>`;
}

function getFinancialMonth(month) {
    const months = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
    return months.indexOf(month) + 1; // Convert month name to a number (1-12)
}

function displayPaymentInfo(data) {
    const paymentInfoBody = document.getElementById('stpayPaymentInfo').getElementsByTagName('tbody')[0];
    const currentMonth = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
    const currentFinancialMonth = getFinancialMonth(currentMonth);

    paymentInfoBody.innerHTML = ''; // Clear existing content

    // Filter out records with archiveInd: 'Yes'
    const validRecords = data.filter(record => record.archiveInd !== 'Yes');

    validRecords.forEach(record => {
        const recordFinancialMonth = getFinancialMonth(record.month);
        // Check if the record month is <= current month, considering financial year crossover
        const isValidMonth = (recordFinancialMonth <= currentFinancialMonth) || (currentFinancialMonth === 1 && recordFinancialMonth === 12);

        if (isValidMonth) {
            paymentInfoBody.innerHTML += 
            `<tr>
                <td>${record.month}</td>
                <td style="
                    background-color: ${record.payment === 'No' ? 'lightcoral' : 
                                    record.payment === 'Yes' ? 'lightgreen' : 
                                    'lightgray'};
                ">
                    ${record.payment === 'No' ? 'Fee Pending' : 
                     record.payment === 'Yes' ? 'Fee Paid' : 
                     'Fee not Required'}
                </td>
            </tr>`;
        }
    });
}



function handleError(error) {
    console.error('Error fetching payment status:', error);
    document.getElementById('stpayError').innerText = error.message || 'An error occurred. Please try again.';
}
