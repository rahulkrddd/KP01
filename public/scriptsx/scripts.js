document.addEventListener('DOMContentLoaded', () => {
  // Tab switching
  const tabs = document.querySelectorAll('.tab');
  const sections = document.querySelectorAll('.container > div');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(section => section.style.display = 'none');

      document.getElementById(tab.id.replace('Tab', 'Section')).style.display = 'block';
      tab.classList.add('active');
    });
  });

  // Handling form submissions
  document.getElementById('searchUpdateForm').addEventListener('submit', handleSearchUpdate);
  document.getElementById('searchAddPaymentForm').addEventListener('submit', handleSearchAddPayment);
  document.getElementById('searchExitForm').addEventListener('submit', handleSearchExit);
});

async function handleSearchUpdate(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const searchParams = new URLSearchParams(formData);

  const response = await fetch('/update?' + searchParams.toString());
  const data = await response.text();
  document.getElementById('updateResults').innerHTML = data;
}

async function handleSearchAddPayment(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const searchParams = new URLSearchParams(formData);

  const response = await fetch('/add_payment?' + searchParams.toString());
  const data = await response.text();
  document.getElementById('addPaymentResults').innerHTML = data;
}

async function handleSearchExit(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const searchParams = new URLSearchParams(formData);

  const response = await fetch('/exit_student?' + searchParams.toString());
  const data = await response.text();
  document.getElementById('exitResults').innerHTML = data;
}
