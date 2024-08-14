        $(function() {
            const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];

            const selectElement = $("#enrollMonth");

            function populateMonths(selectedMonthIndex) {
                selectElement.empty();
                months.forEach((month, index) => {
                    const option = $("<option></option>").val(month).text(month);
                    if (index === selectedMonthIndex) {
                        option.prop("selected", true);
                    }
                    selectElement.append(option);
                });
            }

            // Initialize with the current month
            const now = new Date();
            const currentMonthIndex = now.getMonth();
            populateMonths(currentMonthIndex);

            // Update month based on enrollDate input
            $("#enrollDate").on("change", function() {
                const enrollDate = new Date($(this).val());
                if (!isNaN(enrollDate)) {
                    const enrollMonthIndex = enrollDate.getMonth();
                    populateMonths(enrollMonthIndex);
                }
            });
        });
