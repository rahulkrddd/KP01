// searchHandlers.js
        document.getElementById('updateSearchForm').addEventListener('submit', async function(event) {
            event.preventDefault();
            const query = document.getElementById('updateSearch').value;

            const response = await fetch(`/search?query=${query}`);
            const result = await response.json();
            displaySearchResults('updateResult', result);
        });

        document.getElementById('paymentSearchForm').addEventListener('submit', async function(event) {
            event.preventDefault();
            const query = document.getElementById('paymentSearch').value;

            const response = await fetch(`/search?query=${query}`);
            const result = await response.json();
            displaySearchResults('paymentResult', result);
        });

        document.getElementById('exitSearchForm').addEventListener('submit', async function(event) {
            event.preventDefault();
            const query = document.getElementById('exitSearch').value;

            const response = await fetch(`/search?query=${query}`);
            const result = await response.json();
            displaySearchResults('exitResult', result);
        });