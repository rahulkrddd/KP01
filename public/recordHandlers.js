function displaySearchResults(containerId, results) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Get the current month from the DOM element or use JavaScript to determine it
    const currentMonth = document.getElementById('enrollMonth').value || new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());

    // Define the financial year start month (April) and get the current month index
    const financialYearStartMonth = 'April';
    const monthNames = ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'];
    const startMonthIndex = monthNames.indexOf(financialYearStartMonth);
    const currentMonthIndex = monthNames.indexOf(currentMonth);

    // Function to check if a month is within the financial year range
    function isMonthInRange(month) {
        const monthIndex = monthNames.indexOf(month);
        return monthIndex >= startMonthIndex && monthIndex <= currentMonthIndex;
    }

    // Filter the results to include only those within the financial year range
    const filteredResults = results.filter(result => isMonthInRange(result.month));

    // Create and append the button container
    const buttonContainer = createButtonContainer(filteredResults, containerId);
    container.appendChild(buttonContainer);

    let summaryTable;
    if (filteredResults.length > 1) {
        // Create summary table and append it at the top
        summaryTable = createSummaryTable(filteredResults);
        summaryTable.classList.add('summary-table'); // Add class for styling
        container.appendChild(summaryTable);
    }

    // Create a wrapper for the table to handle responsiveness
    const tableWrapper = document.createElement('div');
    tableWrapper.style.overflowX = 'auto'; // Allow horizontal scroll if necessary

    if (filteredResults.length > 0) {
        // Create a table element for search results
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
        filteredResults.forEach(result => {
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

    // Add CSS styles for responsive table and hidden class
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
        .summary-table.hidden {
            display: none;
        }
        .summary-table td {
            padding: 8px;
            background-color: transparent; // Remove background color
        }
        .summary-table {
            border: 2px solid black; // Add dark border to the table
        }
    `;
    document.head.appendChild(style);
}



function createButtonContainer(results, containerId) {
    // Create a container for buttons
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('button-container');

    // Create a button to toggle the visibility of the summary table
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Toggle Summary';
    toggleButton.classList.add('btn', 'btn-secondary');
    toggleButton.addEventListener('click', () => {
        const summaryTable = document.getElementById(containerId).querySelector('.summary-table');
        if (summaryTable) {
            summaryTable.classList.toggle('hidden');
        }
    });
    buttonContainer.appendChild(toggleButton);

    // Create a button to download the summary table as CSV
    const downloadCsvButton = document.createElement('button');
    downloadCsvButton.textContent = 'Download CSV';
    downloadCsvButton.classList.add('btn', 'btn-success');
    downloadCsvButton.addEventListener('click', () => {
        downloadSummaryAsCSV(results);
    });
    buttonContainer.appendChild(downloadCsvButton);

    // Create a button to print the summary table
    const printButton = document.createElement('button');
    printButton.textContent = 'Print Summary';
    printButton.classList.add('btn', 'btn-info');
    printButton.addEventListener('click', () => {
        printSummaryTable(containerId);
    });
    buttonContainer.appendChild(printButton);

    // Create a button to send the report via email

    const sendEmailButton = document.createElement('button');
    sendEmailButton.textContent = 'Send Report via Email';
    sendEmailButton.classList.add('btn', 'btn-primary');
    sendEmailButton.addEventListener('click', () => {
        sendReportViaEmail(results);
    });
    buttonContainer.appendChild(sendEmailButton);

    return buttonContainer;
}



// Function to handle sending the report via email
function sendReportViaEmail(results) {
    // Convert results to CSV format
    const csvContent = convertResultsToCSV(results);
    
    // Create a FormData object to send the CSV file to the server
    const formData = new FormData();
    formData.append('file', new Blob([csvContent], { type: 'text/csv' }), 'report.csv');
    
    // Send the CSV file to the server for emailing
    fetch('/send-email', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Report sent successfully!');
        } else {
            alert('Failed to send the report.');
        }
    })
    .catch(error => {
        console.error('Error sending email:', error);
        alert('An error occurred while sending the report.');
    });
}

// Function to convert results to CSV format
function convertResultsToCSV(results) {
    // Define the headers for the CSV
    const headers = ['Student ID', 'Name', 'Class', 'School', 'Enroll Date', 'Fee', 'Month', 'Payment', 'Status'];
    
    // Create the rows for the CSV
    const rows = results.map(result => 
        headers.map(header => {
            // Map headers to corresponding data keys
            switch (header) {
                case 'Student ID':
                    return result.id || '';
                case 'Class':
                    return result.studentClass || '';
                case 'Enroll Date':
                    return result.date || '';
                case 'Name':
                    return result.name || '';
                case 'School':
                    return result.school || '';
                case 'Fee':
                    return result.fee || '';
                case 'Month':
                    return result.month || '';
                case 'Payment':
                    return result.payment || '';
                case 'Status':
                    return result.archiveInd || '';
                default:
                    return '';
            }
        }).join(',')
    );

    // Combine headers and rows into CSV format
    return [headers.join(','), ...rows].join('\n');
}


function createSummaryTable(results) {
    // Calculate summary data
    const totalStudents = results.length;
    const uniqueStudents = new Set(results.map(r => r.id)).size;
    const totalFeePaidStudents = results.filter(r => r.payment === 'Yes').length;
    const totalFeePendingStudents = results.filter(r => r.payment === 'No' && r.archiveInd === 'No').length;
    const feeReceived = results.filter(r => r.payment === 'Yes').reduce((sum, r) => sum + parseFloat(r.fee), 0);
    const feePending = results.filter(r => r.payment === 'No' && r.archiveInd === 'No').reduce((sum, r) => sum + parseFloat(r.fee), 0);
    const activeStudents = results.filter(r => r.archiveInd === 'No').length;
    const inactiveStudents = results.filter(r => r.archiveInd === 'Yes').length;

    // Create summary table element
    const table = document.createElement('table');
    table.classList.add('table', 'table-bordered', 'summary-table');
    table.style.marginTop = '20px';
    table.style.width = '100%';
    table.style.border = '2px solid black'; // Add dark border to the table

    // Create table body
    const tbody = document.createElement('tbody');
    [
        ['Total Result Count', totalStudents, 'Total Unique Students', uniqueStudents],
        ['Total Fee Paid Months', totalFeePaidStudents, 'Total Fee Pending Months', totalFeePendingStudents],
        ['Fee Received', feeReceived, 'Pending Fee', feePending],
        ['Active Months', activeStudents, 'Inactive Months', inactiveStudents]
    ].forEach(([label1, value1, label2, value2]) => {
        const row = document.createElement('tr');

        const labelCell1 = document.createElement('td');
        labelCell1.textContent = label1;
        row.appendChild(labelCell1);

        const valueCell1 = document.createElement('td');
        valueCell1.textContent = value1;
        row.appendChild(valueCell1);

        const labelCell2 = document.createElement('td');
        labelCell2.textContent = label2;
        row.appendChild(labelCell2);

        const valueCell2 = document.createElement('td');
        valueCell2.textContent = value2;
        row.appendChild(valueCell2);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    return table;
}

function downloadSummaryAsCSV(results) {
    let csvContent = 'data:text/csv;charset=utf-8,';
    const header = ['Student ID', 'Name', 'Class', 'School', 'Enroll Date', 'Fee', 'Month', 'Payment', 'Status'];
    csvContent += header.join(',') + '\n';

    results.forEach(result => {
        const row = [
            result.id,
            result.name,
            result.studentClass,
            result.school,
            result.date,
            result.fee,
            result.month,
            result.payment,
            result.archiveInd
        ].join(',');
        csvContent += row + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'summary.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function printSummaryTable(containerId) {
    const container = document.getElementById(containerId);
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print Summary</title>');
    printWindow.document.write('<style>table { width: 100%; border-collapse: collapse; } th, td { padding: 8px; border: 1px solid black; text-align: left; } th { background-color: #f2f2f2; }</style>');
    printWindow.document.write('</head><body >');
    printWindow.document.write(container.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
}

function resetFilters() {
    // Logic to reset filters goes here
    console.log('Filters reset');
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
            ${containerId === 'exitResult' ? `
            <div class="form-group">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="${containerId}deletepermanently" ${record.deletepermanently ? 'checked' : ''}>
                    <label class="form-check-label" for="${containerId}deletepermanently">Delete Permanently</label>
                </div>
            </div>
            ` : ''}
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
    const deletePermanentlyCheckbox = document.getElementById(`${containerId}deletepermanently`);
    const deletepermanently = deletePermanentlyCheckbox ? deletePermanentlyCheckbox.checked : false;

    // Show confirmation popup for irreversible action
    if (deletepermanently && !window.confirm("Irreversible Action: Are you sure you want to delete this record permanently?")) {
        return; // Exit the function if the user cancels the action
    }

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
        deletepermanently: deletepermanently // Correctly include checkbox value
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

        // Close the form
        container.innerHTML = ''; // Close the form

        // Display success or error message
        if (result.message === 'This student is already inactive.') {
            showAlert(result.message, 'error'); // Show the message
        } else {
            showAlert(result.message, 'success'); // Display success message for other cases
        }

    } catch (error) {
        console.error('Error:', error);
        showAlert(`An error occurred: ${error.message}`, 'error');
        // Close the form in case of an error
        container.innerHTML = ''; // Close the form
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

        // Append the alert to the container
        container.prepend(alertDiv);

        // Automatically remove the alert after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}
