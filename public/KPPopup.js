document.addEventListener('DOMContentLoaded', () => {
    const title = document.getElementById('logo');
    const popup = document.getElementById('KP-Main-popup');
    const close = document.querySelector('.popup .close');

    // Show the popup when the title is clicked
    title.addEventListener('click', () => {
        popup.style.display = 'block';
    });

    // Hide the popup when the close button is clicked
    close.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    // Hide the popup when clicking outside of the popup content
    window.addEventListener('click', (event) => {
        if (event.target === popup) {
            popup.style.display = 'none';
        }
    });
});
