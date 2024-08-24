function showPopup() {
  document.getElementById('history-high-alert-popup').classList.remove('hidden');
}

function hidePopup() {
  document.getElementById('history-high-alert-popup').classList.add('hidden');
}

function handleResponse(confirmed) {
  hidePopup();
  if (confirmed) {
    deletelogs();
  }
}

async function deletelogs() {
  try {
    const response = await fetch('/deletelogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.text();
    alert(result);
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
}

document.getElementById('deletelogs').addEventListener('click', showPopup);

//DELETE DATA FROM HISTORY.js BY CALLING server.js END  .................................// 


document.addEventListener('DOMContentLoaded', () => {
    // Fetch data from the server
    fetch('/data')
        .then(response => response.json())
        .then(data => {
            // Sort data by timestamp in descending order starts
            data.sort((a, b) => {
                const timestampA = new Date(a[14]).getTime();
                const timestampB = new Date(b[14]).getTime();
                return timestampB - timestampA; // Descending order
            });
			 // Sort data by timestamp in descending order ends
            populateTable(data);
            setupSearchFilters(data);
        })
        .catch(error => console.error('Error fetching data:', error));
});

function populateTable(data) {
    const tbody = document.getElementById('data-body');
    tbody.innerHTML = ''; // Clear existing data

    data.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach((cell, index) => {
            const td = document.createElement('td');
            td.textContent = cell;

            // Apply highlighting based on conditions
            if (index === 1) { // Result column
                if (cell.toLowerCase() === 'pass') {
                    td.style.backgroundColor = 'lightgreen';
                } else if (cell.toLowerCase() === 'fail') {
                    td.style.backgroundColor = 'lightcoral';
                }
            } else if (index === 7) { // Fee column
                const feeValue = parseFloat(cell);
                if (feeValue > 9999 || feeValue < 500) {
                    td.style.backgroundColor = 'lightyellow';
                }
            } else if (index === 9) { // Fee Paid column
                if (cell.toLowerCase() === 'n') {
                    td.style.backgroundColor = 'lightpink';
                }
            } else if (index === 10) { // Achieved column
                if (cell.toLowerCase() === 'y') {
                    td.style.backgroundColor = 'red';
                }
            } else if (index === 11) { // Deleted column
                if (cell.toLowerCase() === 'y') {
                    td.style.backgroundColor = 'red';
                    td.style.color = 'white';
                }
            } else if (index === 12) { // No Fee column
                if (cell.toLowerCase() === 'y') {
                    td.style.backgroundColor = 'yellow';
                }
            } else if (index === 13) { // Reactivated column
                if (cell.toLowerCase() === 'y') {
                    td.style.backgroundColor = 'red';
                    td.style.color = 'white';
                }
            }

            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
}

function setupSearchFilters(data) {
    const searchInputs = {
        'search-id': 0,
        'search-result': 1,
        'search-action': 2,
        'search-name': 3,
        'search-class': 4,
        'search-school': 5,
        'search-date': 6,
        'search-fee': 7,
        'search-month': 8,
        'search-fee-paid': 9,
        'search-achieved': 10,
        'search-deleted': 11,
        'search-no-fee': 12,
        'search-reactivated': 13,
        'search-timestamp': 14
    };

    Object.keys(searchInputs).forEach(inputId => {
        document.getElementById(inputId).addEventListener('input', () => {
            filterTable(searchInputs);
        });
    });

    document.getElementById('reset-filters').addEventListener('click', () => {
        resetFilters();
        filterTable(searchInputs);
    });

    document.getElementById('export-csv').addEventListener('click', () => {
        exportTableToCSV('data.csv');
    });
}

function filterTable(searchInputs) {
    const rows = document.querySelectorAll('#data-body tr');
    rows.forEach(row => {
        let shouldShow = true;
        Object.keys(searchInputs).forEach(inputId => {
            const query = document.getElementById(inputId).value.toLowerCase();
            const columnIndex = searchInputs[inputId];
            const cell = row.cells[columnIndex];
            if (cell) {
                const text = cell.textContent || cell.innerText;
                if (!text.toLowerCase().includes(query)) {
                    shouldShow = false;
                }
            }
        });
        row.style.display = shouldShow ? '' : 'none';
    });
}

function resetFilters() {
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.value = '';
    });
}

function exportTableToCSV(filename) {
    const rows = document.querySelectorAll('table tr');
    const csv = [];

    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const rowCSV = [];
        cols.forEach(col => {
            rowCSV.push(col.innerText);
        });
        csv.push(rowCSV.join(','));
    });

    downloadCSV(csv.join('\n'), filename);
}

function downloadCSV(csv, filename) {
    const csvFile = new Blob([csv], { type: 'text/csv' });
    const downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}
