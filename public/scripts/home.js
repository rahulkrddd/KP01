document.addEventListener('DOMContentLoaded', (event) => {
    let clickCount = 0;
    const logo = document.getElementById('logo');

    logo.addEventListener('click', () => {
        clickCount++;
        if (clickCount === 3) {
            window.location.href = 'payment.html';
        }
    });
});
