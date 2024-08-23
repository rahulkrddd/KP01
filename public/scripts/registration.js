// Calculate the date 9 years before today
const today = new Date();
const nineYearsAgo = new Date(today.setFullYear(today.getFullYear() - 9));
const formattedDate = nineYearsAgo.toISOString().split('T')[0]; // Format as YYYY-MM-DD

// Set the max attribute of the input
document.getElementById('dob').setAttribute('max', formattedDate);
	
	
	
document.getElementById('mobile').addEventListener('input', function() {
    const mobileInput = this.value;
    const errorElement = document.getElementById('mobileError');
    const mobilePattern = /^[6-9]\d{9}$/;

    if (!mobilePattern.test(mobileInput)) {
        errorElement.textContent = 'Mobile number must be correct 10 digits valid number.';
    } else {
        errorElement.textContent = '';
    }
});

document.getElementById('email').addEventListener('input', function() {
    const emailInput = this.value;
    const errorElement = document.getElementById('emailError');
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com)$/;

    if (!emailPattern.test(emailInput)) {
        errorElement.textContent = 'Email must be a valid.';
    } else {
        errorElement.textContent = '';
    }
});




document.getElementById('name').addEventListener('input', function() {
    var nameInput = this.value;
    var nameError = document.getElementById('nameError');

    // Regular expression to check for letters and spaces only
    var namePattern = /^[A-Za-z\s]{3,16}$/;

    if (!namePattern.test(nameInput)) {
        nameError.style.display = 'inline';
    } else {
        nameError.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const registrationForm = document.getElementById('registrationForm');
    const popup = document.getElementById('registrationPopup');
    const popupName = document.getElementById('popupName');
    const popupMobile = document.getElementById('popupMobile');
    const closeBtn = document.querySelector('.registration-popup-close');
    const mobileErrorElement = document.getElementById('mobileError');
    const emailErrorElement = document.getElementById('emailError');

    function getCurrentTimestamp() {
        const now = new Date();
        const offset = 5.5; // IST is UTC+5:30
        const istTime = new Date(now.getTime() + offset * 60 * 60 * 1000);
        return istTime.toISOString().replace('T', ' ').slice(0, 19); // Format: YYYY-MM-DD HH:MM:SS
    }

    function capitalizeName(name) {
        return name
            .toLowerCase() // Convert entire name to lowercase
            .split(' ') // Split by spaces
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
            .join(' '); // Join words back with spaces
    }

    registrationForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(registrationForm);
        const data = {
            name: capitalizeName(formData.get('name')), // Capitalize name
            class: formData.get('class'),
            school: formData.get('school'),
            dob: formData.get('dob'),
            mobile: formData.get('mobile'),
            email: formData.get('email'),
            subject: formData.get('subject'),
			Address: formData.get('Address'), // Add address
            status: 'Pending',
            timestamp: getCurrentTimestamp() // Add current timestamp
        };

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                popupName.textContent = data.name;
                popupMobile.textContent = data.mobile;
                popup.classList.add('show'); // Show the popup with animation
                registrationForm.reset();
                mobileErrorElement.textContent = ''; // Clear previous errors
                emailErrorElement.textContent = ''; // Clear previous errors
            } else {
                // Handle server-side validation errors
                if (result.error) {
                    if (result.error.includes('mobile')) {
                        mobileErrorElement.textContent = result.error;
                    } else if (result.error.includes('email')) {
                        emailErrorElement.textContent = result.error;
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    closeBtn.addEventListener('click', () => {
        popup.classList.remove('show'); // Hide the popup with animation
    });

    // Hide popup when clicking outside of it
    window.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.remove('show');
        }
    });
});

