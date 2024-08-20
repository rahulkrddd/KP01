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
			    <input type="date" class="form-control" id="${containerId}Date" value="${record.date}" ${containerId === 'paymentResult' || containerId === 'exitResult' ? 'readonly' : 'required'} ${containerId === 'updateResult' ? 'title="For other than available dates, Delete the student and Enroll again"' : ''}>
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
					<option value="NA" ${record.payment === 'NA' ? 'selected' : ''}>Fee not Required</option>
                </select>
            </div>
			
			
			
			
			
			<div class="form-group" id="${containerId}ArchiveGroup" style="${containerId === 'updateResult' ? 'display: none;' : ''}">
			    <label for="${containerId}Archive">Student Status</label>
			    <input type="text" class="form-control" id="${containerId}Archive" 
			        value="${record.archiveInd === 'Yes' ? 'Inactive' : 'Active'}" 
			        readonly 
			        style="background-color: ${record.archiveInd === 'Yes' ? 'darkred' : record.archiveInd === 'No' ? 'lightgreen' : 'transparent'}; 
			               color: ${record.archiveInd === 'Yes' ? 'white' : 'black'};">
			</div>



			
            ${containerId === 'updateResult' && record.archiveInd === 'Yes' ? `		
            <div class="form-group">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="${containerId}reactivatestudent" ${record.reactivatestudent ? 'checked' : ''}>
                    <label class="form-check-label" for="${containerId}reactivatestudent">Reactivate Student</label>
                </div>
            </div>		
            ` : ''}


			
			
			
            ${containerId === 'exitResult' ? `	
            <div class="form-group">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="${containerId}deletepermanently" ${record.deletepermanently ? 'checked' : ''}>
                    <label class="form-check-label" for="${containerId}deletepermanently">Delete Permanently</label>
                </div>
            </div>			
            ` : ''}
			

            ${containerId === 'paymentResult' && record.payment === 'No' ? `	
            <div class="form-group">
                <div class="form-check">
                    <input type="checkbox" class="form-check-input" id="${containerId}feenotrequired" ${record.feenotrequired ? 'checked' : ''}>
                    <label class="form-check-label" for="${containerId}feenotrequired">Fee Not Required</label>
                </div>
            </div>			
            ` : ''}
			
<div class="form-group" id="${containerId}AdditionalFields" style="display: none;">
    <label for="${containerId}Mobile">Mobile</label>
    <input type="number" class="form-control" id="${containerId}Mobile" value="${record.mobile || ''}" 
        ${containerId === 'paymentResult' || containerId === 'exitResult' ? 'readonly' : ''} 
        min="6000000000" max="9999999999" 
        title="Please validate the entered mobile number." 
        required>
</div>

<div class="form-group" id="${containerId}AdditionalFields" style="display: none;">
    <label for="${containerId}Email">Email ID</label>
    <input type="email" class="form-control" id="${containerId}Email" value="${record.emailid || ''}" 
        ${containerId === 'paymentResult' || containerId === 'exitResult' ? 'readonly' : ''}
        pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|info)" 
        title="Email must be a valid format (e.g., user@example.com)" 
        required>
</div>
<div class="form-group" id="${containerId}AdditionalFields" style="display: none;">
    <label for="${containerId}Address">Address</label>
    <input type="text" class="form-control" id="${containerId}Address" value="${record.address || ''}" 
        ${containerId === 'paymentResult' || containerId === 'exitResult' ? 'readonly' : ''} 
        maxlength="100" 
        title="Maximum 100 characters allowed." 
        required>
</div>


<button type="button" class="btn btn-secondary" id="${containerId}ToggleFields">Additional Fields</button>

			
			
			
            <button type="submit" class="${buttonClass}">${buttonLabel}</button>
        </form>	
    `;

    container.innerHTML = fields;
//*************************************************************************************************************************//
// STYLE ON ENROLL DATE FIELD PART-01/02, START //
// Initialize tooltips	
$(document).ready(function(){
    $('[title]').tooltip();
});
document.getElementById(`${containerId}ToggleFields`).addEventListener('click', function() {
    const additionalFields = document.querySelectorAll(`#${containerId}AdditionalFields`);
    additionalFields.forEach(field => {
        field.style.display = field.style.display === 'none' ? 'block' : 'none';
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const mobileInput = document.getElementById('${containerId}Mobile');
    const emailInput = document.getElementById('${containerId}Email');
    const addressInput = document.getElementById('${containerId}Address');

    function validateMobile(mobile) {
        // Convert to a string and check the length and starting digit
        const mobileStr = mobile.toString();
        const regex = /^[6789][0-9]{9}$/;
        return regex.test(mobileStr);
    }

    function validateEmail(email) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|info)$/;
        return regex.test(email);
    }

    function validateAddress(address) {
        return address.length <= 100;
    }

    // Example validation check on form submission or field change
    document.getElementById('yourFormId').addEventListener('submit', function(event) {
        const mobile = mobileInput.value;

        if (!validateMobile(mobile)) {
            alert('Invalid mobile number. Must be 10 digits starting with 6, 7, 8, or 9.');
            event.preventDefault();
        }
        if (!validateEmail(emailInput.value)) {
            alert('Invalid email address. Must be in the format user@example.com.');
            event.preventDefault();
        }
        if (!validateAddress(addressInput.value)) {
            alert('Address must be no longer than 100 characters.');
            event.preventDefault();
        }
    });
});




// STYLE ON ENROLL DATE FIELD PART-01/02, END   //

	
// Function to set the date input range starts
function setDateRange() {
    const dateInput = document.getElementById(`${containerId}Date`);
    if (!dateInput) return;

    const recordDate = new Date(record.date);
    const year = recordDate.getFullYear();
    const month = (recordDate.getMonth() + 1).toString().padStart(2, '0'); // Format month to two digits

    const firstDayOfMonth = `${year}-${month}-01`;
    const lastDayOfMonth = new Date(year, recordDate.getMonth() + 1, 0).getDate();
    const lastDayOfMonthFormatted = `${year}-${month}-${lastDayOfMonth.toString().padStart(2, '0')}`;

    // Get today's date
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    const todayDay = today.getDate().toString().padStart(2, '0');
    const todayFormatted = `${todayYear}-${todayMonth}-${todayDay}`;

    // Set the date input range
    dateInput.min = firstDayOfMonth;
    dateInput.max = todayFormatted > lastDayOfMonthFormatted ? lastDayOfMonthFormatted : todayFormatted; // Restrict to today's date or last day of month

    // Optionally, set the default value to the current date if it's within the specified month
    if (dateInput.value < firstDayOfMonth || dateInput.value > dateInput.max) {
        dateInput.value = todayFormatted >= firstDayOfMonth && todayFormatted <= dateInput.max ? todayFormatted : firstDayOfMonth;
    }
}

// Call the function to set the date range
setDateRange();



// Function to set the date input range ends

	
	

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
    const feenotrequiredCheckbox = document.getElementById(`${containerId}feenotrequired`);
    const deletepermanently = deletePermanentlyCheckbox ? deletePermanentlyCheckbox.checked : false;
    const feenotrequired = feenotrequiredCheckbox ? feenotrequiredCheckbox.checked : false;
	
	const reactivatestudentCheckbox = document.getElementById(`${containerId}reactivatestudent`);
    const reactivatestudent = reactivatestudentCheckbox ? reactivatestudentCheckbox.checked : false;

    // Show confirmation popup for irreversible action
    if (reactivatestudent && !window.confirm("Note : This will not change previous months fee and Enroll date, Do you want to contine?")) {
        return; // Exit the function if the user cancels the action
    }

    // Show confirmation popup for irreversible action
    if (deletepermanently && !window.confirm("Irreversible Action: Are you sure you want to delete this record permanently?")) {
        return; // Exit the function if the user cancels the action
    }
	
    // Show confirmation popup for irreversible action
    if (feenotrequired && !window.confirm("Are you sure fee not needed for this month?")) {
        return; // Exit the function if the user cancels the action
    }

//    if (containerId === 'paymentResult' && record.payment === 'Yes') {
//        showAlert('Payment already received', 'error'); // Changed 'warning' to 'error'
//        return; // Exit the function to avoid making unnecessary API calls
//    }

//    if (containerId === 'paymentResult' && record.payment === 'NA') {
//        showAlert('Fee not required for this month, to change go to update page', 'error'); // Changed 'warning' to 'error'
//        return; // Exit the function to avoid making unnecessary API calls
//    }

// Assuming record is your object
		const oldpaymentvalue = record.payment === 'Yes' ? 'Yes' : 'NA';   // Move payment value to oldpaymentvalue



    const updatedRecord = {
        id: document.getElementById(`${containerId}Id`).value,
        name: document.getElementById(`${containerId}Name`).value,
        studentClass: document.getElementById(`${containerId}Class`).value,
        school: document.getElementById(`${containerId}School`).value,
        date: document.getElementById(`${containerId}Date`).value,
        fee: document.getElementById(`${containerId}Fee`).value,
        month: document.getElementById(`${containerId}Month`).value,
        payment: containerId === 'paymentResult' && paymentValue === 'No' ? 'Yes' : paymentValue,
        reactivatestudent: reactivatestudent, // Correctly include checkbox value
        deletepermanently: deletepermanently, // Correctly include checkbox value
        feenotrequired: feenotrequired,       // Correctly include checkbox value
        oldpaymentvalue: oldpaymentvalue,	  // This will help to determine the existing payment values in failed condition
		mobile: document.getElementById(`${containerId}Mobile`).value,
		emailid: document.getElementById(`${containerId}Email`).value,
		address: document.getElementById(`${containerId}Address`).value
    };

    let endpoint = '';
    if (containerId === 'updateResult') {
        endpoint = '/update';
    } else if (containerId === 'paymentResult' && record.payment === 'No') {
        endpoint = '/payment';
    } else if (containerId === 'paymentResult' && record.payment === 'Yes') {
        endpoint = '/paymentfail';
    } else if (containerId === 'paymentResult' && record.payment === 'NA') {
        endpoint = '/paymentfail';
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
		const successKeywords = ['success', 'successful', 'successfully'];
		const isSuccess = successKeywords.some(keyword => result.message.toLowerCase().includes(keyword.toLowerCase()));
		
		if (isSuccess) {
		    showAlert(result.message, 'success'); // Display success message
		} else {
		    showAlert(result.message, 'error'); // Show error message
		}
		

    } catch (error) {
        console.error('Error:', error);
        showAlert(`An error occurred: ${error.message}`, 'error');
        // Close the form in case of an error
        container.innerHTML = ''; // Close the form
    }
});



/***************************************************************************************************************************************/
// STYLE ON ENROLL DATE FIELD PART-02/02, STARTS  //
    // Add CSS styles dynamically
    const style = document.createElement('style');
    style.textContent = `
        /* Tooltip container */
        input[title] {
            position: relative;
        }

        /* Tooltip styling on hover */
        input[title]::after {
            content: attr(title);
            position: absolute;
            background: rgba(0, 0, 0, 0.75);
            color: #fff;
            padding: 8px 12px;
            border-radius: 5px;
            font-size: 14px;
            white-space: nowrap;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%) translateY(-10px);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s ease;
            z-index: 1000;
        }

        /* Make the tooltip visible on hover */
        input[title]:hover::after {
            opacity: 1;
            visibility: visible;
        }
    `;
    document.head.appendChild(style);
// STYLE ON ENROLL DATE FIELD PART-02/02, END  //



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
        // Close the form in case of an error
        container.innerHTML = ''; // Close the form
        // Append the alert to the container
        container.prepend(alertDiv);

        // Automatically remove the alert after 5 seconds
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }

}


