document.addEventListener("DOMContentLoaded", () => {
    const socket = io();
    const tbody = document.getElementById("nettcpconnection");
    const searchInput = document.getElementById("searchInput");

    if (!tbody || !searchInput) return;

    let latestConnections = [];

    function hideSpinner() {
        const spinner = document.getElementById("spinner");
        if (spinner) {
            spinner.classList.remove("show");
        }
    }

    function applyFilterAndRender() {
        tbody.innerHTML = "";

        const filter = searchInput.value.toLowerCase().trim();

        if (latestConnections.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7">No TCP connections found.</td></tr>`;
            hideSpinner();
            return;
        }

        const filterMap = {};
        const keyValueRegex = /(\w+)=([^\s]+)/g;
        let match;
        while ((match = keyValueRegex.exec(filter)) !== null) {
            filterMap[match[1]] = match[2];
        }

        const filtered = latestConnections.filter(conn => {
            for (const key in filterMap) {
                const value = filterMap[key];
                switch (key) {
                    case 'rport':
                        if (String(conn.RemotePort || "").toLowerCase() !== value) return false;
                        break;
                    case 'lport':
                        if (String(conn.LocalPort || "").toLowerCase() !== value) return false;
                        break;
                    case 'raddr':
                        if ((conn.RemoteAddress || '').toLowerCase() !== value) return false;
                        break;
                    case 'laddr':
                        if ((conn.LocalAddress || '').toLowerCase() !== value) return false;
                        break;
                    case 'state':
                        if ((conn.State || '').toLowerCase() !== value) return false;
                        break;
                    case 'pid':
                        if (String(conn.OwningProcess || '').toLowerCase() !== value) return false;
                        break;
                    default:
                        return false;
                }
            }

            if (Object.keys(filterMap).length === 0) {
                const rowText = Object.values(conn).join(" ").toLowerCase();
                return rowText.includes(filter);
            }

            return true;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7">No matching results.</td></tr>`;
            hideSpinner();
            return;
        }

        filtered.forEach(conn => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${conn.LocalAddress || "-"}</td>
                <td>${conn.LocalPort || "-"}</td>
                <td>${conn.RemoteAddress || "-"}</td>
                <td>${conn.RemotePort || "-"}</td>
                <td>${conn.State || "-"}</td>
                <td class="text-center">
                    <button class="show-process btn btn-sm btn-outline-info text-white rounded-pill px-3" data-pid="${conn.OwningProcess}"><i class="bi bi-cpu me-1"></i> ${conn.OwningProcess || "-"}
                    </button>
                </td>
                <td>${conn.FirstSeen || "-"}</td>
            `;
            tbody.appendChild(row);
        });

        hideSpinner();
    }

    // Show spinner initially
    const spinner = document.getElementById("spinner");
    if (spinner) spinner.classList.add("show");

    socket.on("connect", () => {
        console.log("NetTCPConnection Connected");
        socket.emit("get_tcp_connections");
    });

    socket.on("tcp_data", (data) => {
        if (!data.success) {
            tbody.innerHTML = `<tr><td colspan="7">Error: ${data.error}</td></tr>`;
            hideSpinner();
            return;
        }

        let connections = Array.isArray(data.connections) ? data.connections : [data.connections];

        const remoteIPs = [...new Set(
            connections
                .map(conn => conn.RemoteAddress)
                .filter(ip => ip && ip !== "0.0.0.0" && ip !== "::" && ip !== "127.0.0.1" && ip !== "::1")
        )];
        socket.emit("save_remote_ips", remoteIPs);

        connections.sort((a, b) => {
            const parseTimestamp = (ts) => {
                if (!ts) return 0;
                const [datePart, timePart] = ts.split(" ");
                const [hours, minutes, seconds, millis] = timePart.split(":");
                const date = new Date(`${datePart} ${hours}:${minutes}:${seconds}`);
                return date.getTime() + parseInt(millis || "0");
            };
            return parseTimestamp(b.FirstSeen) - parseTimestamp(a.FirstSeen);
        });

        latestConnections = connections;
        applyFilterAndRender();
    });

    searchInput.addEventListener("input", applyFilterAndRender);
});


// Modal for fetching Process Name
document.addEventListener("click", e => {
    if (!e.target.classList.contains("show-process")) return;

    const pid = e.target.dataset.pid;
    const modalContent = document.getElementById("modalContent");

    modalContent.innerHTML = `
        <p class="text-muted">Loading process details...</p>
    `;

    new bootstrap.Modal(document.getElementById('processModal')).show();

    fetch("/api/connection/getpid", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "pid=" + encodeURIComponent(pid)
    })
        .then(res => res.json())
        .then(data => {
            const safeName = document.createTextNode(data.process_name);

            modalContent.innerHTML = `
                <div class="p-3 bg-dark rounded text-white">
                    <h6 class="mb-2">Process Information</h6>
                    <p class="mb-0"><strong>Process Name:</strong> <span id="processName"></span></p>
                </div>
            `;

            document.getElementById("processName").appendChild(safeName);
        })
        .catch(() => {
            modalContent.innerHTML = `
                <p class="text-danger">Failed to fetch process details</p>
            `;
        });
});
