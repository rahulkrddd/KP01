// Get elements
const kpvar = document.getElementById('knowledgePointTitle');
const popup = document.getElementById('popup');
const closeBtn = document.getElementById('close-btn');

// Function to show the popup
function showPopup() {
    popup.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling when popup is open
}

// Function to hide the popup
function hidePopup() {
    popup.style.display = 'none';
    document.body.style.overflow = 'auto'; // Allow scrolling when popup is closed
}

// Show the popup when the kpvar is clicked
kpvar.addEventListener('click', showPopup);

// Hide the popup when the close button is clicked
closeBtn.addEventListener('click', hidePopup);

// Hide the popup if the user clicks outside of the popup content
window.addEventListener('click', (event) => {
    if (event.target === popup) {
        hidePopup();
    }
});
