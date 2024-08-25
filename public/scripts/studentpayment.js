document.getElementById('stpayForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Clear previous results
    document.getElementById('stpayError').innerText = '';
    document.getElementById('stpayResults').style.display = 'none';
    document.getElementById('stpayStudentInfo').getElementsByTagName('tbody')[0].innerHTML = '';
    document.getElementById('stpayPaymentInfo').getElementsByTagName('tbody')[0].innerHTML = '';

    const name = document.getElementById('stpayName').value;
    const mobile = document.getElementById('stpayMobile').value;
    const studentId = document.getElementById('stpayId').value;

    try {
        const response = await fetch('/studentpayment/check-payment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, mobile, studentId })
        });

        // Check if response is successful
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Network response was not ok');
        }

        const data = await response.json();

        if (data.length === 0) {
            document.getElementById('stpayError').innerText = 'No records found';
        } else {
            // Display results
            document.getElementById('stpayResults').style.display = 'block';

            // Insert student info
            const studentInfoBody = document.getElementById('stpayStudentInfo').getElementsByTagName('tbody')[0];
            const firstRecord = data[0];
            studentInfoBody.innerHTML = `
                <tr>
                    <td>${firstRecord.name}</td>
                    <td>${firstRecord.id}</td>
                    <td>${firstRecord.studentClass}</td>
                    <td>${firstRecord.school}</td>
                    <td>${firstRecord.date}</td>
                     <!-- Removed fee here "<td>${firstRecord.fee}</td>" -->
                </tr>
            `;

            // Insert payment info (all records)
            const paymentInfoBody = document.getElementById('stpayPaymentInfo').getElementsByTagName('tbody')[0];
            data.forEach(record => {
                paymentInfoBody.innerHTML += `
                    <tr>
                        <td>${record.month}</td>
                        <td>${record.payment}</td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error('Error fetching payment status:', error);
        document.getElementById('stpayError').innerText = error.message || 'An error occurred. Please try again.';
    }
});
