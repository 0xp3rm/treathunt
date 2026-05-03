document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname === "/dash/board") {
        const updateStats = (data) => {
            document.getElementById("ipCount").textContent = data.ip_count ?? "0";
            document.getElementById("sshFailedCount").textContent = data.ssh_log_count ?? "0";
            document.getElementById("sshIpCount").textContent = data.ssh_ip_count ?? "0";

            const tableBody = document.getElementById("dashboardSshLogs");
            if (tableBody) {
                tableBody.innerHTML = "";

                (data.ssh_logs || []).forEach(entry => {
                    const row = document.createElement("tr");

                    const ipCell = document.createElement("td");
                    ipCell.textContent = entry.ip_address;
                    row.appendChild(ipCell);

                    const countCell = document.createElement("td");
                    countCell.textContent = entry.ip_fail_count;
                    row.appendChild(countCell);

                    tableBody.appendChild(row);
                });
            }
        };

        fetch("/api/board/info")
            .then(response => response.json())
            .then(updateStats)
            .catch(err => {
                console.error("Failed to load dashboard stats:", err);
            });

        setInterval(() => {
            fetch("/api/board/info")
                .then(response => response.json())
                .then(updateStats)
                .catch(err => {
                    console.error("Failed to poll IP count:", err);
                });
        }, 5000);
    }
});
