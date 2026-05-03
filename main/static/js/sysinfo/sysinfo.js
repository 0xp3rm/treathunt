document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname === "/dash/sysinfo") {
        $('#spinner').addClass('show');  // Show spinner before fetch

        fetch("/api/sysinfo")
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById("sysinfo-content");

                if (!data.success) {
                    const errorMsg = data.error || "No error message provided by backend.";
                    container.innerHTML = `<div class="text-danger">Failed to load system info: ${errorMsg}</div>`;
                    return;
                }

                let sysInfo = data.systeminfo;
                if (!sysInfo) {
                    container.innerHTML = `<div class="text-danger">No system info returned from server.</div>`;
                    return;
                }

                if (typeof sysInfo === "string") {
                    try {
                        sysInfo = JSON.parse(sysInfo);
                    } catch (e) {
                        container.innerHTML = `<div class="text-danger">Invalid JSON format in system info.</div>`;
                        return;
                    }
                }

                let html = `<table class="table table-dark table-striped table-bordered mt-4 text-start">`;
                for (const [key, value] of Object.entries(sysInfo)) {
                    html += `
                        <tr>
                            <th class="text-capitalize">${key.replace(/([a-z])([A-Z])/g, "$1 $2")}</th>
                            <td>${Array.isArray(value) ? value.join(", ") : value ?? "N/A"}</td>
                        </tr>
                    `;
                }
                html += `</table>`;
                container.innerHTML = html;
            })
            .catch(error => {
                document.getElementById("sysinfo-content").innerHTML =
                    `<div class="text-danger">Unexpected error: ${error.message}</div>`;
            })
            .finally(() => {
                $('#spinner').removeClass('show');
            });
    }
});
