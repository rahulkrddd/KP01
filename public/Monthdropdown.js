        $(function() {
            const months = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            const now = new Date();
            const currentMonthIndex = now.getMonth();
            const selectElement = $("#enrollMonth");
            months.forEach((month, index) => {
                const option = $("<option></option>").val(month).text(month);
                if (index === currentMonthIndex) {
                    option.prop("selected", true);
                }
                selectElement.append(option);
            });
        });
