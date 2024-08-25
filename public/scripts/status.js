document.addEventListener('DOMContentLoaded', () => {
    const statusForm = document.getElementById('statusForm');
    const statusPopup = document.getElementById('statusPopup');
    const statusPopupMessage = document.getElementById('statusPopupMessage');
    const statusPopupClose = document.getElementById('statusPopupClose');
    const statusViewDetails = document.getElementById('statusViewDetails');
    const statusEditDetails = document.getElementById('statusEditDetails');
    const statusRetryButtons = document.getElementById('statusRetryButtons');
    const statusRegistration = document.getElementById('statusRegistration');
    const statusRetry = document.getElementById('statusRetry');
    const statusPopupButtons = document.getElementById('statusPopupButtons');
    const detailsForm = document.getElementById('detailsForm');
    const backToStatusForm = document.getElementById('backToStatusForm');
    const updateButton = document.getElementById('updateDetails');

    // Reference to the input fields in the details form
    const detailsName = document.getElementById('detailsName');
    const detailsMobile = document.getElementById('detailsMobile');
    const detailsClass = document.getElementById('detailsClass');
    const detailsSchool = document.getElementById('detailsSchool');
    const detailsDob = document.getElementById('detailsDob');
    const detailsEmail = document.getElementById('detailsEmail');
    const detailsSubject = document.getElementById('detailsSubject');
    const detailsStatus = document.getElementById('detailsStatus');

    // Calculate the date 9 years before today
    const today = new Date();
    const nineYearsAgo = new Date(today.setFullYear(today.getFullYear() - 9));
    const formattedDate = nineYearsAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    // Set the max attribute of the input
    document.getElementById('detailsDob').setAttribute('max', formattedDate);

    document.getElementById('detailsName').addEventListener('input', function() {
        const nameField = this;
        const errorSpan = document.getElementById('nameError');
        const nameValue = nameField.value;
        const regex = /^[A-Za-z\s]+$/; // Allows only letters and spaces
        if (nameValue.length < 3 || nameValue.length > 16 || !regex.test(nameValue)) {
            errorSpan.textContent = 'Name must be between 3 and 16 characters and contain only letters.';
            errorSpan.style.display = 'inline';
        } else {
            errorSpan.style.display = 'none';
        }
    });

    async function validateMobileNumber() {
        const mobileInput = document.getElementById('detailsMobile');
        const errorSpan = document.getElementById('mobileError');
        const mobileNumber = mobileInput.value;

        const regex = /^[6-9][0-9]{9}$/;

        if (!regex.test(mobileNumber)) {
            errorSpan.textContent = 'Invalid mobile number format.';
            errorSpan.style.display = 'inline';
            return;
        }

        try {
            const response = await fetch(`/check-mobile?mobile=${mobileNumber}`);
            const result = await response.json();

            if (result.exists) {
                errorSpan.textContent = 'This mobile number is already registered with other student.';
                errorSpan.style.display = 'inline';
            } else {
                errorSpan.style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking mobile number:', error);
        }
    }

    async function validateEmail() {
        const emailInput = document.getElementById('detailsEmail');
        const errorSpan = document.getElementById('emailError');
        const email = emailInput.value;

        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!regex.test(email)) {
            errorSpan.textContent = 'Invalid email format.';
            errorSpan.style.display = 'inline';
            return;
        }

        try {
            const response = await fetch(`/check-email?email=${email}`);
            const result = await response.json();

            if (result.exists) {
                errorSpan.textContent = 'This email ID is already registered with other student.';
                errorSpan.style.display = 'inline';
            } else {
                errorSpan.style.display = 'none';
            }
        } catch (error) {
            console.error('Error checking email:', error);
        }
    }

    document.getElementById('detailsMobile').addEventListener('blur', validateMobileNumber);
    document.getElementById('detailsEmail').addEventListener('blur', validateEmail);

    statusForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(statusForm);
        const data = {
            mobile: formData.get('mobile'),
            name: formData.get('name'),
            timestamp: new Date().toISOString() // Include timestamp in the request
        };

        try {
            const response = await fetch('/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                displayPopup(result);
            } else {
                console.error('Error fetching status:', result);
                displayPopup({ error: result.error || 'Error fetching status. Please try again later.' });
            }
        } catch (error) {
            console.error('Error:', error);
            displayPopup({ error: 'Error fetching status. Please try again later.' });
        }
    });

function displayPopup(result) {
    statusPopup.style.display = 'block';
    if (result.error) {
        statusPopupMessage.innerHTML = `<strong class="status-error">${result.error}</strong>`;
        statusPopupButtons.style.display = 'none';
        statusRetryButtons.style.display = 'flex'; // Show retry buttons
    } else {
        statusPopupMessage.innerHTML = `Status for ${result.name} (${result.mobile}): <strong class="${getStatusClass(result.status)}">${result.status}</strong>`;
        statusRetryButtons.style.display = 'none'; // Hide retry buttons
        statusPopupButtons.style.display = 'flex'; // Show status buttons

        // Save result data for details view/edit
        detailsName.value = result.name;
        detailsMobile.value = result.mobile;
        detailsClass.value = result.class;
        detailsSchool.value = result.school;
        detailsDob.value = result.dob;
        detailsEmail.value = result.email;
        detailsSubject.value = result.subject;
        detailsAddress.value = result.Address;
        detailsStatus.value = result.status;

        // Store the timestamp for later use
        detailsForm.dataset.timestamp = result.timestamp;

        console.log("Status: ", result.status);

        // Enable/Disable the "Edit Details" button based on status
        if (result.status.toLowerCase() !== 'pending') {
            statusEditDetails.classList.remove('button'); // Ensure the class is removed if status is Pending
            statusEditDetails.disabled = true; // Disable the button	
			statusEditDetails.classList.add('button-disabled-new');
			statusEditDetails.classList.remove('button-enabled-new');

        } else {
            statusEditDetails.classList.add('button');
            statusEditDetails.disabled = false; // Enable the button
			statusEditDetails.classList.add('button-enabled-new');
			statusEditDetails.classList.remove('button-disabled-new');
    // Toggle button color based on disabled state

        }
    }
}


    function getStatusClass(status) {
        switch(status.toLowerCase()) {
            case 'pending':
                return 'status-pending';
            case 'approved':
                return 'status-approved';
            case 'declined':
                return 'status-declined';
            default:
                return '';
        }
    }

    function closePopup() {
        statusPopup.style.display = 'none';
    }

    statusPopupClose.addEventListener('click', closePopup);

    statusViewDetails.addEventListener('click', () => {
        statusForm.style.display = 'none';
        detailsForm.style.display = 'block';
        closePopup(); // Close the popup

        // Disable the Update button
        updateButton.disabled = true;
        updateButton.style.backgroundColor = '#d3d3d3'; // Gray out the button
        updateButton.style.cursor = 'not-allowed'; // Change cursor to indicate disabled state
    });

    statusEditDetails.addEventListener('click', () => {
        statusForm.style.display = 'none';
        detailsForm.style.display = 'block';
        closePopup(); // Close the popup

        // Enable fields for editing
        detailsName.disabled = false;
        detailsMobile.disabled = false;
        detailsClass.disabled = false;
        detailsSchool.disabled = false;
        detailsDob.disabled = false;
        detailsEmail.disabled = false;
        detailsSubject.disabled = false;
        detailsAddress.disabled = false;
        detailsStatus.disabled = true;

    });

    statusRetry.addEventListener('click', () => {
        statusPopup.style.display = 'none';
        statusForm.reset();
    });

    statusRegistration.addEventListener('click', () => {
        window.location.href = 'registration.html';
        closePopup(); // Close the popup
    });

    backToStatusForm.addEventListener('click', () => {
        window.location.href = 'status.html'; // Navigate to status.html
    });

    // Add event listener for the Update button
    updateButton.addEventListener('click', async () => {
        const updatedData = {
            name: detailsName.value,
            mobile: detailsMobile.value,
            class: detailsClass.value,
            school: detailsSchool.value,
            dob: detailsDob.value,
            email: detailsEmail.value,
            subject: detailsSubject.value,
            Address: detailsAddress.value,
            status: detailsStatus.value,
            timestamp: detailsForm.dataset.timestamp // Include timestamp
        };

        try {
            const response = await fetch('/status', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Details updated successfully.');
                window.location.href = 'status.html'; // Navigate to status.html
            } else {
                console.error('Update failed:', result);
                alert('Failed to update details: ' + (result.error || 'Unknown error.'));
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating details. Please try again later.');
        }
    });
});
