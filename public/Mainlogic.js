// main.js
        function showEnroll() {
            document.getElementById('enroll').style.display = 'block';
            document.getElementById('update').style.display = 'none';
            document.getElementById('payment').style.display = 'none';
            document.getElementById('exit').style.display = 'none';
            setActiveTab('enroll');
        }

        function showUpdate() {
            document.getElementById('enroll').style.display = 'none';
            document.getElementById('update').style.display = 'block';
            document.getElementById('payment').style.display = 'none';
            document.getElementById('exit').style.display = 'none';
            setActiveTab('update');
        }

        function showAddPayment() {
            document.getElementById('enroll').style.display = 'none';
            document.getElementById('update').style.display = 'none';
            document.getElementById('payment').style.display = 'block';
            document.getElementById('exit').style.display = 'none';
            setActiveTab('payment');
        }

        function showExit() {
            document.getElementById('enroll').style.display = 'none';
            document.getElementById('update').style.display = 'none';
            document.getElementById('payment').style.display = 'none';
            document.getElementById('exit').style.display = 'block';
            setActiveTab('exit');
        }

        function setActiveTab(tabId) {
            $(".nav-link").removeClass("active");
            $("#" + tabId).prev().addClass("active");
        }

        function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        // Set the default active tab to "Enroll"
        showEnroll();
		
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('enrollDate').value = today;
    document.getElementById('enrollMonth').value = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date());
});
