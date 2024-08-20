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

        // Define the desired columns
        const desiredColumns = [
            'id',
            'name',
            'studentClass',
            'school',
            'date',
            'fee',
            'month',
            'payment',
            'archiveInd'
        ];
//table header decoration  - starts 
        // Create the table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        desiredColumns.forEach(column => {
            const th = document.createElement('th');
            switch (column) {
                case 'id':
                    th.textContent = 'Student ID';
                    break;
                case 'name':
                    th.textContent = 'Name';
                    break;
                case 'studentClass':
                    th.textContent = 'Class';
                    break;
                case 'school':
                    th.textContent = 'School';
                    break;
                case 'date':
                    th.textContent = 'Enroll Date';
                    break;
                case 'fee':
                    th.textContent = 'Fee';
                    break;
                case 'month':
                    th.textContent = 'Month';
                    break;
                case 'payment':
                    th.textContent = 'Payment';
                    break;
                case 'archiveInd':
                    th.textContent = 'Status';
                    break;
            }
            th.style.textAlign = 'center'; // Center justify header text
            th.style.padding = '0px'; // Add some padding
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
//table header decoration  - ends 
        // Create the table body
        const tbody = document.createElement('tbody');
        filteredResults.forEach(result => {
            const row = document.createElement('tr');

            desiredColumns.forEach(column => {
                const td = document.createElement('td');
                td.style.padding = '8px'; // Add some padding
                td.style.textAlign = 'center'; // Center justify text

                if (result.hasOwnProperty(column)) {
                    const value = result[column];
					if (column === 'id') {
					    // Set the button text to the actual Student ID
					    const button = document.createElement('button');
					    button.textContent = result.id;  // Set the button text to the student ID
					    button.classList.add('btn', 'btn-info');
						button.style.transform = 'scale(1.0)';  // Scale the button by 90%
					    button.addEventListener('click', () => showAdditionalDetails(result));
					    td.appendChild(button);
					    td.style.cursor = 'pointer'; // Change cursor to pointer for button

                    } else if (column === 'payment') {
                        td.textContent = value; // Default content for desktop
                        // Set background color based on payment value
                        if (value === 'Yes') {
                            td.style.backgroundColor = 'lightgreen';
                        } else if (value === 'No') {
                            td.style.backgroundColor = 'lightcoral';
                        } else {
                            td.style.backgroundColor = '#EBEBE4';
                        }
                        td.classList.add('mobile-payment');
                        td.dataset.paymentValue = value; // Add a custom data attribute
                    } else if (column === 'archiveInd') {
                        td.textContent = value === 'Yes' ? 'Inactive' : 'Active';
                        td.style.backgroundColor = value === 'Yes' ? 'lightcoral' : 'lightgreen';
                    } else {
                        td.textContent = value;
                    }

                    // Add a class to the "month" and "payment" fields for mobile-specific styling
                    if (column === 'month') {
                        td.classList.add('mobile-month');
                    }
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
@media (max-width: 767.98px) {
    .btn {
        width: 100%;
    }
}

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
            .mobile-payment[data-payment-value="NA"]::after {
                content: ' (Fee not Required)';
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
        .popup-additional {
            display: none; /* Hidden by default */
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: white;
            border: 1px solid #ccc;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 1000;
        }
        .popup-additional.show {
            display: block; /* Show when the class is added */
        }
        .popup-additional .popup-header {
            font-weight: bold;
            margin-bottom: 10px;
        }
        .popup-additional .popup-content {
            margin-bottom: 10px;
        }
        .popup-additional .popup-footer {
            text-align: right;
        }
        .popup-additional .popup-close {
            background-color: #f44336;
            color: white;
            border: none;
            padding: 5px 10px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
}

// Function to show additional details in a popup
// Function to show additional details in a popup
function showAdditionalDetails(student) {
    const popup = document.createElement('div');
    popup.id = 'popup-additional-' + student.id;
    popup.classList.add('popup-additional');

    const header = document.createElement('div');
    header.classList.add('popup-header');
    header.innerHTML = `
        <h2>Additional Details for Student ID: ${student.id}</h2>
    `;
    popup.appendChild(header);

    const content = document.createElement('div');
    content.classList.add('popup-content');
    content.innerHTML = `
        <p><strong>Mobile:</strong> ${student.mobile}</p>
        <p><strong>Email ID:</strong> ${student.emailid}</p>
        <p><strong>Address:</strong> ${student.address}</p>
    `;
    popup.appendChild(content);

    const footer = document.createElement('div');
    footer.classList.add('popup-footer');
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.classList.add('popup-close');
    closeButton.addEventListener('click', () => {
        popup.classList.remove('show');
        overlay.classList.remove('show');
        setTimeout(() => {
            popup.remove();
            overlay.remove();
        }, 300); // Remove after animation
    });
    footer.appendChild(closeButton);
    popup.appendChild(footer);

    // Create a blur background
    const overlay = document.createElement('div');
    overlay.classList.add('popup-overlay');
    document.body.appendChild(overlay);

    document.body.appendChild(popup);
    setTimeout(() => {
        popup.classList.add('show');
        overlay.classList.add('show');
    }, 10); // Allow time for overlay to be added before showing
}


/*********************************************************************************************************************************************************/
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

    // Append the link to the body to make it clickable
    document.body.appendChild(link);

    // Trigger the download
    link.click();

    // Use a timeout to check if the download was likely successful
    setTimeout(() => {
        // Check if the link is still in the DOM
        if (document.body.contains(link)) {
            // If the link is still present, it might indicate that the download failed
            showPopup(encodedUri);
        }
        // Remove the link from the DOM
        document.body.removeChild(link);
    }, 1000); // Adjust the timeout as needed
}

function showPopup(encodedUri) {
    // Create the overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.left = '0';
    overlay.style.top = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.backdropFilter = 'blur(5px)';
    overlay.style.zIndex = '999'; // Position it below the popup

    // Create the popup container
    const popup = document.createElement('div');
    popup.style.position = 'fixed';
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.padding = '20px';
    popup.style.backgroundColor = '#fff';
    popup.style.border = '1px solid #ddd';
    popup.style.borderRadius = '12px';
    popup.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
    popup.style.zIndex = '1000';
    popup.style.textAlign = 'center';
    popup.style.maxWidth = '90vw'; // Adjust width for mobile
    popup.style.width = '400px';   // Set a max width for larger screens
    popup.style.boxSizing = 'border-box';
    popup.style.fontFamily = 'Arial, sans-serif';
    popup.style.fontSize = '16px';



    // Create the message element
    const messageElement = document.createElement('p');
    messageElement.innerHTML = `Link copied.<br>Paste in browser.`;
    messageElement.style.marginBottom = '20px';
    messageElement.style.wordBreak = 'break-word'; // Ensure long URLs break properly
    messageElement.style.lineHeight = '1.5';
    popup.appendChild(messageElement);

// Create the success button
const successButton = document.createElement('button');
successButton.innerText = 'Success';
successButton.style.padding = '12px 24px';
successButton.style.border = 'none';
successButton.style.borderRadius = '8px';
successButton.style.backgroundColor = '#28a745'; // Green color
successButton.style.color = '#fff';
successButton.style.cursor = 'pointer';
successButton.style.fontSize = '16px';
successButton.style.fontWeight = 'bold';
successButton.style.marginRight = '10px';
successButton.style.transition = 'background-color 0.3s';

// Event listener for button click
successButton.addEventListener('click', () => {
    if (navigator.userAgent.match(/Android/i)) {
        // Force open in Chrome using intent URL scheme
        window.location.href = 'intent://kp02a.onrender.com#Intent;scheme=https;package=com.android.chrome;end';
        document.body.removeChild(overlay); // Remove the overlay
        document.body.removeChild(popup); // Remove the popup
    } else {
        // Do nothing if not an Android device
        console.log('This functionality is designed for Android devices.');
    }
});

successButton.addEventListener('mouseover', () => {
    successButton.style.backgroundColor = '#218838'; // Darker shade on hover
});

successButton.addEventListener('mouseout', () => {
    successButton.style.backgroundColor = '#28a745'; // Original color
});

popup.appendChild(successButton);

    // Create the close button
    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.style.padding = '12px 24px';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '8px';
    closeButton.style.backgroundColor = '#007bff';
    closeButton.style.color = '#fff';
    closeButton.style.cursor = 'pointer';
    closeButton.style.fontSize = '16px';
    closeButton.style.fontWeight = 'bold';
    closeButton.style.transition = 'background-color 0.3s';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(popup);
    });
    closeButton.addEventListener('mouseover', () => {
        closeButton.style.backgroundColor = '#0056b3'; // Darker shade on hover
    });
    closeButton.addEventListener('mouseout', () => {
        closeButton.style.backgroundColor = '#007bff'; // Original color
    });
    popup.appendChild(closeButton);

    // Append the overlay and popup to the body
    document.body.appendChild(overlay);
    document.body.appendChild(popup);

    // Copy the link to clipboard
    navigator.clipboard.writeText(encodedUri).then(() => {
        console.log('Link copied to clipboard');
    }).catch(err => {
        console.error('Could not copy text: ', err);
    });
}





function printSummaryTable(containerId) {
    const container = document.getElementById(containerId);
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Print Summary</title>');
    printWindow.document.write('<style>');
    printWindow.document.write('table { width: 100%; border-collapse: collapse; }');
    printWindow.document.write('th, td { padding: 8px; border: 1px solid black; text-align: left; }');
    printWindow.document.write('th { background-color: #f2f2f2; }');
    printWindow.document.write('button {');
    printWindow.document.write('  background-color: #EBEBE4;'); // Default button color
    printWindow.document.write('  color: black;');
    printWindow.document.write('  border: none;');
    printWindow.document.write('  padding: 10px 20px;');
    printWindow.document.write('  margin: 5px;');
    printWindow.document.write('  cursor: pointer;');
    printWindow.document.write('  font-size: 16px;');
    printWindow.document.write('}');
    printWindow.document.write('button.close-btn { background-color: red; color: white; }'); // Close button
    printWindow.document.write('button.print-btn { background-color: green; color: white; }'); // Print button
    printWindow.document.write('button:hover { opacity: 0.8; }');
    printWindow.document.write('</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write('<div>');
    printWindow.document.write('<button class="print-btn" onclick="window.print();">Print</button>');
    printWindow.document.write('<button class="close-btn" onclick="window.close();">Close</button>');
    printWindow.document.write('</div>');
    printWindow.document.write(container.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
}



function resetFilters() {
    // Logic to reset filters goes here
    console.log('Filters reset');
}
