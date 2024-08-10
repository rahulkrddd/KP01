function displaySearchResults(containerId, results) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Create a wrapper for the table to handle responsiveness
    const tableWrapper = document.createElement('div');
    tableWrapper.style.overflowX = 'auto'; // Allow horizontal scroll if necessary

    if (results.length > 0) {
        // Create a table element
        const table = document.createElement('table');
        table.classList.add('table', 'table-striped');
        table.style.width = '100%'; // Ensure the table takes full width

        // Create the table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Student ID', 'Name', 'Class', 'School', 'Enroll Date', 'Fee', 'Month', 'Payment', 'Status', 'Action'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            th.style.textAlign = 'center'; // Center justify header text
            th.style.padding = '8px'; // Add some padding
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create the table body
        const tbody = document.createElement('tbody');
        results.forEach(result => {
            const row = document.createElement('tr');

            Object.entries(result).forEach(([key, value]) => {
                const td = document.createElement('td');
                td.style.padding = '8px'; // Add some padding
                td.style.textAlign = 'center'; // Center justify text

                if (key === 'payment') {
                    td.textContent = value; // Default content for desktop
                    td.style.backgroundColor = value === 'Yes' ? 'lightgreen' : 'lightcoral';
                    td.classList.add('mobile-payment');
                    td.dataset.paymentValue = value; // Add a custom data attribute
                } else if (key === 'archiveInd') {
                    td.textContent = value === 'Yes' ? 'Inactive' : 'Active';
                    td.style.backgroundColor = value === 'Yes' ? 'lightcoral' : 'lightgreen';
                } else {
                    td.textContent = value;
                }

                // Add a class to the "month" and "payment" fields for mobile-specific styling
                if (key === 'month') {
                    td.classList.add('mobile-month');
                }

                row.appendChild(td);
            });

            // Add action button
            const actionTd = document.createElement('td');
            const selectButton = document.createElement('button');
            selectButton.textContent = 'Select';
            selectButton.classList.add('btn', 'btn-primary');
            selectButton.addEventListener('click', () => editRecord(containerId, result));
            actionTd.appendChild(selectButton);
            row.appendChild(actionTd);
            tbody.appendChild(row);
        });

        table.appendChild(tbody);
        tableWrapper.appendChild(table);
        container.appendChild(tableWrapper);
    } else {
        container.textContent = 'No records found.';
    }

    // Add CSS styles for responsive table
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            table {
                display: block;
                width: 100%;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }
            th, td {
                display: block;
                width: 100%;
                box-sizing: border-box;
            }
            thead {
                display: none;
            }
            tr {
                display: flex;
                flex-wrap: wrap;
                margin-bottom: 10px;
                border-bottom: 1px solid #ddd;
            }
            td {
                text-align: left;
                position: relative;
                padding: 8px;
                border-bottom: 1px solid #ddd;
                box-sizing: border-box;
            }
            td::before {
                content: attr(data-label);
                position: absolute;
                left: 0;
                width: 40%;
                padding-right: 10px;
                white-space: nowrap;
                text-align: left;
                font-weight: bold;
            }
            .mobile-month {
                font-weight: bold;
            }
            .mobile-payment {
                font-weight: bold;
                display: block;
                text-align: left; /* Align text to the left for better visibility */
            }
            .mobile-payment::before {
                content: '';
                display: none; /* Hide the original content */
            }
            .mobile-payment[data-payment-value="Yes"]::after {
                content: ' (Fee Paid)';
            }
            .mobile-payment[data-payment-value="No"]::after {
                content: ' (Fee Pending)';
            }
        }
    `;
    document.head.appendChild(style);
}



function editRecord(containerId, record) {
    const container = document.getElementById(containerId);

    let buttonLabel = "Save";
    let buttonClass = "btn btn-primary";

    if (containerId === 'exitResult') {
        buttonLabel = "Confirm Delete";
        buttonClass = "btn btn-danger";
    } else if (containerId === 'paymentResult') {
        buttonLabel = "Confirm Payment";
        buttonClass = "btn btn-success";
    }

    let fields = `
        <form id="${containerId}Form">
            <input type="hidden" id="${containerId}Id" value="${record.id}">
            <div class="form-group">
                <label for="${containerId}Name">Name</label>
                <input type="text" class="form-control" id="${containerId}Name" value="${record.name}" ${containerId === 'paymentResult' || containerId === 'exitResult' ? 'readonly' : 'required'}>
            </div>
            <div class="form-group">
                <label for="${containerId}Class">Class</label>
                <select class="form-control" id="${containerId}Class" ${containerId === 'paymentResult' || containerId === 'exitResult' ? 'disabled' : 'required'}>
                    ${Array.from({ length: 12 }, (_, i) => i + 1).map(value =>
                        `<option value="${value}" ${record.studentClass === value.toString() ? 'selected' : ''}>${value}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label for="${containerId}School">School</label>
                <select class="form-control" id="${containerId}School" ${containerId === 'paymentResult' || containerId === 'exitResult' ? 'disabled' : 'required'}>
                    <option value="KCPS" ${record.school === 'KCPS' ? 'selected' : ''}>KCPS</option>
					<option value="Banjari" ${record.school === 'Banjari' ? 'selected' : ''}>Banjari</option>
                    <option value="Atmanand" ${record.school === 'Atmanand' ? 'selected' : ''}>Atmanand</option>
                    <option value="KV" ${record.school === 'KV' ? 'selected' : ''}>KV</option>
                    <option value="DPS" ${record.school === 'DPS' ? 'selected' : ''}>DPS</option>
                    <option value="Inventure" ${record.school === 'Inventure' ? 'selected' : ''}>Inventure</option>
                    <option value="Others" ${record.school === 'Others' ? 'selected' : ''}>Others</option>
                </select>
            </div>
            <div class="form-group">
                <label for="${containerId}Date">Enroll Date</label>
                <input type="date" class="form-control" id="${containerId}Date" value="${record.date}" ${containerId === 'paymentResult' || containerId === 'exitResult' ? 'readonly' : 'required'}>
            </div>
            <div class="form-group">
                <label for="${containerId}Fee">Fee Amount</label>
                <input type="number" class="form-control" id="${containerId}Fee" value="${record.fee}" ${containerId === 'paymentResult' || containerId === 'exitResult' ? 'readonly' : 'required'}>
            </div>
            <div class="form-group">
                <label for="${containerId}Month">Month</label>
                <input type="text" class="form-control" id="${containerId}Month" value="${record.month}" 
                       ${containerId === 'paymentResult' || containerId === 'exitResult' || containerId === 'updateResult' ? 'readonly' : 'required'}>
            </div>
            <div class="form-group">
                <label for="${containerId}Payment">Payment Received</label>
                <select class="form-control" id="${containerId}Payment" 
                    ${containerId === 'exitResult' || containerId === 'paymentResult' ? 'disabled' : ''} 
                    ${containerId !== 'exitResult' && containerId !== 'paymentResult' ? 'required' : ''}>
                    <option value="No" ${record.payment === 'No' ? 'selected' : ''}>No</option>
                    <option value="Yes" ${record.payment === 'Yes' ? 'selected' : ''}>Yes</option>
                </select>
            </div>
            <div class="form-group">
                <label for="${containerId}Archive">Student Status</label>
                <input type="text" class="form-control" id="${containerId}Archive" 
                    value="${record.archiveInd === 'Yes' ? 'Inactive' : 'Active'}" 
                    readonly 
                    style="background-color: ${record.archiveInd === 'Yes' ? 'darkred' : record.archiveInd === 'No' ? 'lightgreen' : 'transparent'}; 
                           color: ${record.archiveInd === 'Yes' ? 'white' : 'black'};">
            </div>
            <button type="submit" class="${buttonClass}">${buttonLabel}</button>
        </form>
    `;

    container.innerHTML = fields;

    function updatePaymentFieldColor() {
        const paymentField = document.getElementById(`${containerId}Payment`);
        const paymentValue = paymentField.value;
        paymentField.style.backgroundColor = paymentValue === 'Yes' ? 'lightgreen' : paymentValue === 'No' ? 'lightcoral' : '';
    }

    updatePaymentFieldColor();
    document.getElementById(`${containerId}Payment`).addEventListener('change', updatePaymentFieldColor);

document.getElementById(`${containerId}Form`).addEventListener('submit', async function(event) {
    event.preventDefault();
    const paymentField = document.getElementById(`${containerId}Payment`);
    const paymentValue = paymentField.value;

    if (containerId === 'paymentResult' && record.payment === 'Yes') {
        showAlert('Payment already received', 'error'); // Changed 'warning' to 'error'
        return; // Exit the function to avoid making unnecessary API calls
    }

    const updatedRecord = {
        id: document.getElementById(`${containerId}Id`).value,
        name: document.getElementById(`${containerId}Name`).value,
        studentClass: document.getElementById(`${containerId}Class`).value,
        school: document.getElementById(`${containerId}School`).value,
        date: document.getElementById(`${containerId}Date`).value,
        fee: document.getElementById(`${containerId}Fee`).value,
        month: document.getElementById(`${containerId}Month`).value,
        payment: containerId === 'paymentResult' && paymentValue === 'No' ? 'Yes' : paymentValue,
    };

    let endpoint = '';
    if (containerId === 'updateResult') {
        endpoint = '/update';
    } else if (containerId === 'paymentResult') {
        endpoint = '/payment';
    } else if (containerId === 'exitResult') {
        endpoint = '/exit';
    }

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedRecord),
        });

        const result = await response.json();
        
        // Check for specific error messages and handle them
        if (result.message === 'This student is already inactive.' || result.message.includes('Oops')) {
            showAlert(result.message, 'error');
        } else {
            showAlert(result.message, 'success');
        }

    } catch (error) {
        console.error('Error:', error);
        showAlert(`An error occurred: ${error.message}`, 'error');
    }
});


function showAlert(message, type) {
    const alertDiv = document.createElement('div');

    // Define alert class based on the type
    const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';

    alertDiv.className = `alert ${alertClass} alert-dismissible fade show`;
    alertDiv.role = 'alert';
    alertDiv.innerHTML = `
        <strong>${type === 'error' ? 'Error!' : 'Success!'}</strong> ${message}
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;

    container.innerHTML = '';
    container.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.classList.add('show');
        alertDiv.classList.remove('fade');
    }, 100);
    setTimeout(() => {
        alertDiv.classList.add('fade');
        alertDiv.classList.remove('show');
    }, 10000);
}

}
