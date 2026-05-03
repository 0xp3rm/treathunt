document.addEventListener("DOMContentLoaded", () => {
    const socket = io();

    socket.on("connect", () => {
        console.log("Connected to server");
    });

    if (window.location.pathname === '/dash/ssh') {
        socket.on("ssh_status", data => {
            const sshStatus = document.getElementById("ssh-status");
            if (sshStatus) {
                sshStatus.innerText = data.status;
            }
        });


        socket.on("ssh_attempt", (data) => {
            const tbody = document.getElementById("ssh-anomaly-log-body");

            const row = document.createElement("tr");

            const timeCell = document.createElement("td");
            timeCell.textContent = data.timestamp;

            const msgCell = document.createElement("td");
            msgCell.textContent = data.message;

            row.appendChild(timeCell);
            row.appendChild(msgCell);

            tbody.insertBefore(row, tbody.firstChild);
        });

        socket.on("ssh_log_cleared", () => {
            const anomalyLogTbody = document.getElementById("ssh-anomaly-log-body");
            if (anomalyLogTbody) anomalyLogTbody.innerHTML = "";

            const ipSummaryTbody = document.getElementById("ssh-attempt-log-body");
            if (ipSummaryTbody) ipSummaryTbody.innerHTML = "";
        });

        socket.on("ssh_failed_ip_count", (data) => {
            const tbody = document.getElementById("ssh-attempt-log-body");
            if (!tbody) return;

            const existingIPs = new Set();

            data.forEach(item => {
                const ip = item.IPAddress;
                const failCount = item.FailAttempt;
                existingIPs.add(ip);

                let row = tbody.querySelector(`tr[data-ip="${ip}"]`);

                if (row) {
                    const countCell = row.querySelector(".fail-count");
                    if (countCell) {
                        countCell.textContent = failCount;
                    }
                } else {
                    row = document.createElement("tr");
                    row.setAttribute("data-ip", ip);

                    const ipCell = document.createElement("td");
                    ipCell.textContent = ip;

                    const countCell = document.createElement("td");
                    countCell.textContent = failCount;
                    countCell.classList.add("fail-count");

                    const buttonCell = document.createElement("td");
                    buttonCell.innerHTML = `
                <div class="d-flex justify-content-end gap-4">
<!--                <button type="button" class="btn btn-outline-success btn-sm rounded-pill px-4 me-2" onclick="showIplookup('${ip}')">Trace</button>       -->
                    <button type="button" class="btn btn-outline-info rounded-pill btn-sm px-4" onclick="allowSshIP('${ip}')">Allow</button>
                    <button type="button" class="btn btn-outline-danger btn-sm rounded-pill px-4 me-2" onclick="blockSshIP('${ip}')">Block</button>
                </div>
            `;

                    row.appendChild(ipCell);
                    row.appendChild(countCell);
                    row.appendChild(buttonCell);
                    tbody.appendChild(row);
                }
            });

            Array.from(tbody.querySelectorAll("tr")).forEach(row => {
                const ip = row.getAttribute("data-ip");
                if (!existingIPs.has(ip)) {
                    row.remove();
                }
            });
        });

    }

});