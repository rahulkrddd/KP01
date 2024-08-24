document.addEventListener('DOMContentLoaded', async () => {
    const loadRecordsButton = document.getElementById('loadRecords');
    const approveButton = document.getElementById('approveSelected');
    const declineButton = document.getElementById('declineSelected');
    const deleteButton = document.getElementById('deleteSelected');
    const clearFileButton = document.getElementById('clearFile');
    const classFilter = document.getElementById('classFilter');
    const schoolFilter = document.getElementById('schoolFilter');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');
    const selectAllCheckbox = document.getElementById('selectAll');

    // Automatically load records when the page loads
    await loadRecords();
	
    statusFilter.value = 'Pending';
    filterRecords(); // Call filterRecords to apply the default filter


    async function loadRecords() {
        try {
            const response = await fetch('/admin/records');
            if (!response.ok) throw new Error('Network response was not ok');
            const records = await response.json();
            displayRecords(records);
        } catch (error) {
            console.error('Error fetching records:', error);
        }
    }

	function displayRecords(records) {
	    const tableBody = document.querySelector('#recordsTable tbody');
	    tableBody.innerHTML = ''; // Clear existing records
		
	    // Sort records by timestamp in descending order
		records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
	
	    records.forEach(record => {
	        const row = document.createElement('tr');
	        const checkboxDisabled = record.status !== 'Pending' ? 'disabled' : '';
	
	        row.innerHTML = `
	            <td><input type="checkbox" value="${record.timestamp}" ${checkboxDisabled} /></td>
	            <td>${record.name}</td>
	            <td>${record.class}</td>
	            <td>${record.school}</td>
	            <td>${record.dob}</td>
	            <td>${record.mobile}</td>
	            <td>${record.email}</td>
	            <td>${record.subject}</td>
	            <td>${record.timestamp}</td>
	            <td class="status">${record.status}</td>
	        `;
	        tableBody.appendChild(row);
	    });
	
	    // Add event listener for Select All checkbox
	    selectAllCheckbox.addEventListener('change', function() {
	        const rows = document.querySelectorAll('#recordsTable tbody tr');
	        rows.forEach(row => {
	            if (row.style.display !== 'none') { // Only consider visible rows
	                const checkbox = row.querySelector('input[type="checkbox"]');
	                if (!checkbox.disabled) { // Only consider enabled checkboxes
	                    checkbox.checked = selectAllCheckbox.checked;
	                }
	            }
	        });
	    });
	}
	
	function filterRecords() {
	    const classValue = classFilter.value.toLowerCase();
	    const schoolValue = schoolFilter.value.toLowerCase();
	    const statusValue = statusFilter.value.toLowerCase();
	    const searchValue = searchInput.value.toLowerCase();
	
	    const rows = document.querySelectorAll('#recordsTable tbody tr');
	    let visibleRowCount = 0;
	    let checkedRowCount = 0;
	
	    rows.forEach(row => {
	        const classText = row.cells[2].textContent.toLowerCase();
	        const schoolText = row.cells[3].textContent.toLowerCase();
	        const statusText = row.cells[9].textContent.toLowerCase();
	        const rowText = row.textContent.toLowerCase();
	
	        const matchesFilter = (classValue === '' || classText.includes(classValue)) &&
	                              (schoolValue === '' || schoolText.includes(schoolValue)) &&
	                              (statusValue === '' || statusText.includes(statusValue));
	
	        const matchesSearch = rowText.includes(searchValue);
	
	        if (matchesFilter && matchesSearch) {
	            row.style.display = '';
	            visibleRowCount++;
	            const checkbox = row.querySelector('input[type="checkbox"]');
	            if (checkbox.checked && !checkbox.disabled) {
	                checkedRowCount++;
	            }
	        } else {
	            row.style.display = 'none';
	        }
	    });
	
	    // Update Select All checkbox state for visible and enabled rows
	    selectAllCheckbox.checked = visibleRowCount > 0 && visibleRowCount === checkedRowCount;
	}
	
	
	    classFilter.addEventListener('change', filterRecords);
	    schoolFilter.addEventListener('change', filterRecords);
	    statusFilter.addEventListener('change', filterRecords);
	    searchInput.addEventListener('input', filterRecords);
	
	    approveButton.addEventListener('click', async () => {
	        await handleAction('approve');
	    });
	
	    declineButton.addEventListener('click', async () => {
	        await handleAction('decline');
	    });
	
	    deleteButton.addEventListener('click', async () => {
	        await handleAction('delete');
	    });
	
	    clearFileButton.addEventListener('click', async () => {
	        if (confirm('Are you sure you want to clear all records? This action cannot be undone.')) {
	            try {
	                const response = await fetch('/admin/clear', {
	                    method: 'POST',
	                    headers: {
	                        'Content-Type': 'application/json'
	                    }
	                });
	                const result = await response.json();
	                if (response.ok) {
	                    document.querySelector('#recordsTable tbody').innerHTML = '';
	                } else {
	                    console.error('Failed to clear the records:', result);
	                }
	            } catch (error) {
	                console.error('Error clearing file:', error);
	            }
	        }
	    });
	


async function handleAction(action) {
    const checkboxes = document.querySelectorAll('#recordsTable tbody input[type="checkbox"]:checked');
    const timestamps = Array.from(checkboxes).map(checkbox => checkbox.value);

    if (timestamps.length === 0) {
        openPopup('Please select records to ' + action + '.');
        return;
    }

    try {
        const response = await fetch(`/admin/${action}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ timestamps })
        });

        const result = await response.json(); // Read the JSON response

        if (!response.ok) {
            console.error(`Error during ${action}:`, result);
            openPopup(`Failed to ${action} records. ${result.message || ''}`);
            return;
        }

        // Update records display based on action
        if (action === 'delete') {
            removeDeletedRecords(timestamps);
        } else {
            updateRecordsDisplay(result.updatedRecords || []); // Use result.updatedRecords if available
        }

        // Show success message
        openPopup(`Records successfully ${action}d.`);
    } catch (error) {
        openPopup(`Error occurred while ${action} records.`);
    }
}



	
	function updateRecordsDisplay(updatedRecords) {
	    const rows = document.querySelectorAll('#recordsTable tbody tr');
	
	    updatedRecords.forEach(record => {
	        const row = Array.from(rows).find(row => row.querySelector('input[type="checkbox"]').value === record.timestamp);
	
	        if (row) {
	            const statusCell = row.querySelector('.status');
	            const checkbox = row.querySelector('input[type="checkbox"]');
	
	            // Update the status text
	            statusCell.textContent = record.status;
	
	            // Disable checkbox if status is not 'Pending'
	            checkbox.disabled = record.status !== 'Pending';
	
	            // Uncheck the checkbox if the status is not 'Pending'
	            if (record.status !== 'Pending') {
	                checkbox.checked = false;
	            }
	        }
	    });
	
	    // Optionally update Select All checkbox state
	    updateSelectAllCheckboxState();
	}
	
	function removeDeletedRecords(timestamps) {
	    const rows = document.querySelectorAll('#recordsTable tbody tr');
	
	    timestamps.forEach(timestamp => {
	        const row = Array.from(rows).find(row => row.querySelector('input[type="checkbox"]').value === timestamp);
	        if (row) {
	            row.remove();
	        }
	    });
	
	    // Optionally update Select All checkbox state
	    updateSelectAllCheckboxState();
	}
	
	function updateSelectAllCheckboxState() {
	    const rows = document.querySelectorAll('#recordsTable tbody tr');
	    const selectAllCheckbox = document.getElementById('selectAll');
	    const totalCheckboxes = rows.length;
	    const checkedCheckboxes = document.querySelectorAll('#recordsTable tbody input[type="checkbox"]:checked').length;
	
	    selectAllCheckbox.checked = totalCheckboxes > 0 && totalCheckboxes === checkedCheckboxes;
	}
})


function openPopup(message) {
    document.getElementById('popup-message').textContent = message;
    document.getElementById('admin-approval-popup').style.display = 'flex';
}

function closePopup() {
    document.getElementById('admin-approval-popup').style.display = 'none';
}

;
