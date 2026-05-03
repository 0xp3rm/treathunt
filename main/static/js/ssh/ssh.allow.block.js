async function allowSshIP(ipAddress) {
    $('#spinner').addClass('show');

    return fetch("/api/ssh/allow", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ ipAddress })
    })
        .then(async response => {
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Unknown error");
            }
            return response.json();
        })
        .then(data => {
            if (data.message && data.message.includes("already exists")) {
                iziToast.info({
                    title: 'Info',
                    message: `${ipAddress} is already allowed in the firewall.`,
                    position: 'topRight'
                });
            } else {
                iziToast.success({
                    title: 'Success',
                    message: `${ipAddress} added to firewall allowlist`,
                    position: 'topRight'
                });
            }
        })
        .catch(error => {
            console.error("Error:", error);
            iziToast.error({
                title: 'Error',
                message: error.message || 'Failed to add IP to firewall',
                position: 'topRight'
            });
        })
        .finally(() => {
            setTimeout(() => {
                if ($('#spinner').length > 0) {
                    $('#spinner').removeClass('show');
                }
            }, 1);
        });
}

async function blockSshIP(ipAddress) {
    $('#spinner').addClass('show');

    return fetch("/api/ssh/block", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({ ipAddress })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            if (data.message && data.message.includes("already exists")) {
                iziToast.info({
                    title: 'Info',
                    message: `${ipAddress} is already blocked in the firewall.`,
                    position: 'topRight'
                });
            } else {
                iziToast.success({
                    title: 'Success',
                    message: `${ipAddress} added to firewall blocklist`,
                    position: 'topRight'
                });
            }
        })
        .catch(error => {
            console.error("Error:", error);
            iziToast.error({
                title: 'Error',
                message: error.message || 'Failed to add IP to firewall',
                position: 'topRight'
            });
        })
        .finally(() => {
            setTimeout(() => {
                if ($('#spinner').length > 0) {
                    $('#spinner').removeClass('show');
                }
            }, 1);
        });
}

async function deleteSshIP(ipAddress) {
    $('#spinner').addClass('show');

    try {
        const response = await fetch("/api/ssh/delete", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({ ipAddress })
        });

        const data = await response.json();

        if (!response.ok) {
            iziToast.error({
                title: 'Error',
                message: data.error || 'Failed to delete firewall rule.',
                position: 'topRight'
            });
        } else {
            iziToast.success({
                title: 'Success',
                message: data.success || 'Firewall rule deleted.',
                position: 'topRight'
            });
        }

    } catch (error) {
        console.error("Error:", error);
        iziToast.error({
            title: 'Error',
            message: error.message || 'Unexpected error occurred.',
            position: 'topRight'
        });
    } finally {
        setTimeout(() => {
            $('#spinner').removeClass('show');
        }, 1);
    }
}


function showSSHAllowRule() {
    $('#spinner').addClass('show');

    fetch("/api/ssh/allowssh", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById("ssh-allow-ip-rule");
            tbody.innerHTML = "";

            if (!data.ips || data.ips.length === 0) {
                const row = document.createElement("tr");
                const cell = document.createElement("td");
                cell.colSpan = 2;
                cell.className = "text-center text-muted";
                cell.textContent = "No IP addresses are currently allowed through the firewall.";
                row.appendChild(cell);
                tbody.appendChild(row);
                return;
            }

            data.ips.forEach(ip => {
                const row = document.createElement("tr");

                const ipCell = document.createElement("td");
                ipCell.textContent = ip;
                row.appendChild(ipCell);

                const actionCell = document.createElement("td");
                actionCell.className = "text-end";

                const allowBtn = document.createElement("button");
                allowBtn.textContent = "Block";
                allowBtn.className = "btn btn-info btn-sm me-4";
                allowBtn.onclick = () => {
                    blockSshIP(ip).then(() => {
                        showSSHBlockRule();
                        showSSHAllowRule();
                    });
                };

                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete";
                deleteBtn.className = "btn btn-danger btn-sm";
                deleteBtn.onclick = () => {
                    deleteSshIP(ip).then(() => {
                        showSSHAllowRule();
                    });
                };

                actionCell.appendChild(allowBtn);
                actionCell.appendChild(deleteBtn);
                row.appendChild(actionCell);

                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error fetching SSH allow rules:", error);
        })
        .finally(() => {
            setTimeout(() => {
                if ($('#spinner').length > 0) {
                    $('#spinner').removeClass('show');
                }
            }, 1);
        });
}

function showSSHBlockRule() {
    $('#spinner').addClass('show');

    fetch("/api/ssh/blockssh", {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            const tbody = document.getElementById("ssh-block-ip-rule");
            tbody.innerHTML = "";

            if (!data.ips || data.ips.length === 0) {
                const row = document.createElement("tr");
                const cell = document.createElement("td");
                cell.colSpan = 2;
                cell.className = "text-center text-muted";
                cell.textContent = "No IP addresses are currently blocked through the firewall.";
                row.appendChild(cell);
                tbody.appendChild(row);
                return;
            }

            data.ips.forEach(ip => {
                const row = document.createElement("tr");

                const ipCell = document.createElement("td");
                ipCell.textContent = ip;
                row.appendChild(ipCell);

                const actionCell = document.createElement("td");
                actionCell.className = "text-end";

                const allowBtn = document.createElement("button");
                allowBtn.textContent = "Allow";
                allowBtn.className = "btn btn-info btn-sm me-4";
                allowBtn.onclick = () => {
                    allowSshIP(ip).then(() => {
                        showSSHBlockRule();
                        showSSHAllowRule();
                    });
                };

                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "Delete";
                deleteBtn.className = "btn btn-danger btn-sm";
                deleteBtn.onclick = () => {
                    deleteSshIP(ip).then(() => {
                        showSSHBlockRule();
                    });
                };

                actionCell.appendChild(allowBtn);
                actionCell.appendChild(deleteBtn);
                row.appendChild(actionCell);

                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Error fetching SSH block rules:", error);
        })
        .finally(() => {
            setTimeout(() => {
                if ($('#spinner').length > 0) {
                    $('#spinner').removeClass('show');
                }
            }, 1);
        });
}
