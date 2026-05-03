let ipMapInstance;

function loadRemoteIPs() {
    fetch("/api/board/remoteip")
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById("dashRemoteIPdata");
            tbody.innerHTML = "";

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="2" class="text-center text-muted">No Remote IPs found.</td></tr>`;
                return;
            }

            data.forEach((item) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="text-start align-middle px-3 border-end-0">${item.ip_address}</td>
                    <td class="text-end align-middle border-end-0">
                        <div class="d-flex justify-content-end flex-wrap gap-4 px-2">
                            <button class="btn btn-sm btn-outline-success" onclick="showIplookup('${item.ip_address}')">Lookup</button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteRemoteIP('${item.ip_address}')">Delete</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(() => {
            document.getElementById("dashRemoteIPdata").innerHTML =
                "<tr><td colspan='2' class='text-center text-danger'>Failed to load Remote Address</td></tr>";
        });
}

function deleteRemoteIP(ip) {
    const formData = new URLSearchParams();
    formData.append("ip", ip);

    fetch("/api/board/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString()
    })
        .then(res => res.json().then(data => ({ status: res.status, data })))
        .then(({ status, data }) => {
            if (status === 200) {
                iziToast.success({
                    title: "Deleted",
                    message: data.message,
                    position: "topRight",
                    timeout: 2000
                });
                loadRemoteIPs();
            } else {
                iziToast.error({
                    title: "Error",
                    message: data.message || "Failed to delete IP",
                    position: "topRight",
                    timeout: 3000
                });
            }
        })
        .catch(err => {
            iziToast.error({
                title: "Error",
                message: err.message || "Unexpected error occurred",
                position: "topRight",
                timeout: 3000
            });
        });
}

function deleteRemoteIPRecord() {
    fetch("/api/board/clear", { method: "POST" })
        .then(res => res.json().then(data => ({ status: res.status, data })))
        .then(({ status, data }) => {
            if (status === 200) {
                iziToast.success({
                    title: "Cleared",
                    message: data.message,
                    position: "topRight",
                    timeout: 3000
                });
                loadRemoteIPs();
            } else {
                iziToast.error({
                    title: "Error",
                    message: data.message || "Failed to clear IP records.",
                    position: "topRight",
                    timeout: 4000
                });
            }
        })
        .catch(err => {
            iziToast.error({
                title: "Error",
                message: err.message || "Unexpected error occurred.",
                position: "topRight",
                timeout: 4000
            });
        });
}

function showIplookup(ip) {
    const modal = new bootstrap.Modal(document.getElementById("showLookUpDetails"));
    modal.show();

    const container = document.getElementById("ipDetailsText");

    container.innerHTML = `
        <div class="text-center" style="height:400px;border-radius:10px;">
            <div class="spinner-border text-primary" role="status"></div>
        </div>
    `;

    document.getElementById("lookupError").classList.add("d-none");

    fetch(`/api/board/lookup/${ip}`)
        .then(res => res.json().then(data => ({ status: res.status, data })))
        .then(({ status, data }) => {
            if (status !== 200) {
                throw new Error(data.error || "Failed to resolve the request");
            }

            const fields = {
                query: "IP Address",
                isp: "ISP/Network",
                city: "City",
                regionName: "Region",
                zip: "Postal Code",
                country: "Country",
                lat: "Latitude",
                lon: "Longitude",
                timezone: "Timezone",
                as: "ASN",
                org: "Organization"
            };

            let tableHtml = `<table class="table table-dark rounded"><tbody>`;

            for (const key in fields) {
                tableHtml += `
                    <tr>
                        <td class="fw-bold bg-light" style="width:35%;">${fields[key]}</td>
                        <td>${data[key] ?? "N/A"}</td>
                    </tr>
                `;
            }

            tableHtml += `</tbody></table>`;
            container.innerHTML = tableHtml;

            const lat = data.lat;
            const lng = data.lon;

            if (!lat || !lng) return;

            if (!ipMapInstance) {
                ipMapInstance = L.map("ipMap").setView([lat, lng], 10);
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: "&copy; OpenStreetMap contributors"
                }).addTo(ipMapInstance);
            } else {
                ipMapInstance.setView([lat, lng], 10);
                if (ipMapInstance._marker) {
                    ipMapInstance.removeLayer(ipMapInstance._marker);
                }
            }

            ipMapInstance._marker = L.marker([lat, lng])
                .addTo(ipMapInstance)
                .bindPopup(`<strong>${data.query}</strong><br>${data.city || ""}, ${data.country || ""}`)
                .openPopup();

            setTimeout(() => ipMapInstance.invalidateSize(), 400);
        })
        .catch(err => {
            console.error("IP lookup failed:", err);

            container.innerHTML = "";

            iziToast.error({
                title: "Error",
                message: err.message,
                position: "topRight",
                timeout: 3000
            });

            document.getElementById("lookupError").classList.remove("d-none");
        });
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname === "/dash/board") {
        loadRemoteIPs();
        setInterval(loadRemoteIPs, 5000);
    }
});