document.getElementById('enrollName').addEventListener('input', function() {
    const name = this.value;
    const nameError = document.getElementById('nameError');
    const nameValidation = document.getElementById('nameValidation');
    
    // Regular expression to check if name contains numbers
    const hasNumbers = /\d/.test(name);
    
    // Check name length and number presence
    if (name.length < 3) {
        nameError.textContent = 'Name should be at least 3 characters long.';
        nameError.style.display = 'block';
        nameValidation.innerHTML = '<span style="color: red;">&#10060;</span>'; // Red cross for invalid
    } else if (name.length > 12 || hasNumbers) {
        nameError.textContent = 'Name should not exceed 12 characters and should not contain numbers.';
        nameError.style.display = 'block';
        nameValidation.innerHTML = '<span style="color: red;">&#10060;</span>'; // Red cross for invalid
    } else {
        nameError.style.display = 'none';
        nameValidation.innerHTML = '<span style="color: green;">&#10004;</span>'; // Green checkmark for valid
    }
});

document.getElementById('enrollForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get form values
    const name = document.getElementById('enrollName').value;
    const studentClass = document.getElementById('enrollClass').value;
    const school = document.getElementById('enrollSchool').value;
    const date = document.getElementById('enrollDate').value;
    const fee = document.getElementById('enrollFee').value;
    const month = document.getElementById('enrollMonth').value;
    const payment = document.getElementById('enrollPayment').value;

    // Validate name one more time before sending
    const nameError = document.getElementById('nameError');
    const hasNumbers = /\d/.test(name);

    if (name.length < 3) {
        showMessage('Name should be at least 3 characters long.', 'error');
        return;
    } else if (name.length > 12 || hasNumbers) {
        showMessage('Name should not exceed 12 characters and should not contain numbers.', 'error');
        return;
    }

    // Send data to the server
    const response = await fetch('/enroll', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, studentClass, school, date, fee, month, payment }),
    });

    // Parse the response
    const result = await response.json();
    
    // Show message
    if (result.message.includes('Oops')) {
        showMessage(result.message, 'error');
    } else {
        showMessage(result.message, 'success');
    }
});

function showMessage(message, type) {
    const messageElement = document.getElementById('enrollMessage');
    
    // Clear previous styles and classes
    messageElement.className = ''; // Clear any previous classes
    messageElement.style.opacity = '1'; // Ensure opacity is reset
    messageElement.style.transform = 'translateX(-50%)'; // Ensure horizontal transform is reset
    messageElement.style.bottom = ''; // Clear any bottom style applied from previous submission
    messageElement.style.visibility = 'visible'; // Ensure visibility

    // Set common styles
    messageElement.style.padding = '1rem';
    messageElement.style.borderRadius = '0.5rem';
    messageElement.style.zIndex = '1000';
    messageElement.style.maxWidth = '90vw'; /* Adjust to ensure visibility */
    messageElement.style.width = 'auto'; /* Allow dynamic width */
    messageElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    messageElement.style.fontSize = '1.25rem'; /* Initial font size */
    messageElement.style.fontWeight = 'bold';
    messageElement.style.color = '#fff';
    messageElement.style.textAlign = 'center';
    messageElement.style.overflow = 'hidden';
    messageElement.style.whiteSpace = 'normal'; /* Allow text wrapping */
    messageElement.style.wordWrap = 'break-word';
    messageElement.style.textOverflow = 'clip'; /* Ensure text is properly displayed */
    messageElement.style.maxHeight = '30vh'; /* Limit height */
    messageElement.style.position = 'fixed';
    messageElement.style.left = '50%';
    messageElement.style.bottom = '1rem';
    messageElement.style.transform = 'translateX(-50%)';

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '0';
    closeButton.style.right = '0';
    closeButton.style.background = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = '#fff';
    closeButton.style.fontSize = '1.5rem';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0.5rem';

    // Close button event listener
    closeButton.addEventListener('click', () => {
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(2rem)'; // Move up slightly before fading
        setTimeout(() => {
            messageElement.style.visibility = 'hidden'; // Hide the message element after fade-out
        }, 500);
    });

    // Remove previous close button if it exists
    const existingCloseButton = messageElement.querySelector('button');
    if (existingCloseButton) {
        existingCloseButton.remove();
    }

    // Determine message type
    if (type === 'error') {
        messageElement.style.backgroundColor = '#dc3545'; // Red
        messageElement.textContent = message;
    } else {
        messageElement.style.backgroundColor = '#28a745'; // Green
        messageElement.textContent = message;

        // Add success animation (confetti effect)
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        messageElement.appendChild(confetti);
    }

    // Append close button
    messageElement.appendChild(closeButton);

    // Adjust font size dynamically based on message length
    function adjustFontSize() {
        const maxHeight = window.innerHeight * 0.3; // 30% of viewport height
        let fontSize = 1.25; // Initial font size in rem
        messageElement.style.fontSize = `${fontSize}rem`;

        while (messageElement.scrollHeight > maxHeight && fontSize > 0.5) {
            fontSize -= 0.1; // Reduce font size
            messageElement.style.fontSize = `${fontSize}rem`;
        }
    }

    // Adjust font size
    adjustFontSize();
}
