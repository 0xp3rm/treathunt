function loadFirewallRules() {
    const tbody = document.getElementById("ruleFirewallBody");
    if (!tbody) return;

    $('#spinner').addClass('show'); 

    fetch("/api/rule/showfirewall")
        .then(res => {
            if (!res.ok) throw new Error("Failed to fetch firewall rules.");
            return res.json();
        })
        .then(data => {
            tbody.innerHTML = "";
            if (!data || data.status !== "success" || data.rules.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" class="text-center">
                            User-defined firewall rules are empty.
                        </td>
                    </tr>`;
                return;
            }

            data.rules.forEach(rule => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${rule.DisplayName}</td>
                    <td>${rule.Direction}</td>
                    <td>${rule.Protocol}</td>
                    <td>${rule.Action}</td>
                    <td>${rule.LocalPort}</td>
                    <td>${rule.LocalAddress}</td>
                    <td>${rule.RemotePort}</td>
                    <td>${rule.RemoteAddress}</td>
                    <td>
                        <div class="d-flex justify-content-center">
                            
                            <button class="btn btn-sm btn-danger delete-btn me-2" data-rule-name="${rule.DisplayName}">
                                <i class="fa fa-trash"></i>
                            </button>
                            
                        </div>
                    </td>

                    `;

                const deleteBtn = row.querySelector(".delete-btn");
                if (deleteBtn) {
                    deleteBtn.addEventListener("click", (e) => {
                        const ruleName = deleteBtn.getAttribute("data-rule-name");

                        const ruleNameDisplay = document.getElementById("ruleToDeleteName");
                        const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

                        if (ruleNameDisplay) ruleNameDisplay.textContent = ruleName;
                        if (confirmDeleteBtn) confirmDeleteBtn.setAttribute("data-rule-name", ruleName);

                        const modalElement = document.getElementById("deleteRuleModal");
                        if (modalElement) {
                            const modal = new bootstrap.Modal(modalElement);
                            modal.show();
                        }
                    });
                }


                const allowBtn = row.querySelector(".allow-btn");
                if (allowBtn) {
                    allowBtn.addEventListener("click", (e) => {
                        const ruleName = allowBtn.getAttribute("data-rule-name");

                        const ruleNameDisplay = document.getElementById("ruleToAllowName");
                        const confirmAllowBtn = document.getElementById("confirmAllowBtn");

                        if (ruleNameDisplay) ruleNameDisplay.textContent = ruleName;
                        if (confirmAllowBtn) confirmAllowBtn.setAttribute("data-rule-name", ruleName);

                        const modalElement = document.getElementById("allowRuleModal");
                        if (modalElement) {
                            const modal = new bootstrap.Modal(modalElement);
                            modal.show();
                        }
                    });
                }

                tbody.appendChild(row);
            });

        })
        .catch(error => {
            console.error(error);
            iziToast.error({
                title: "Error",
                message: error.message,
                position: "topRight"
            });
        })
        .finally(() => {
            $('#spinner').removeClass('show'); 
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const ruleForm = document.getElementById("ruleFirewallFormCreation");
    if (ruleForm) {
        ruleForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const formData = new URLSearchParams(new FormData(this));

            fetch("/api/rule/addfirewall", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData
            })
                .then(response => {
                    if (!response.ok) throw new Error("Request Failed");
                    return response.json();
                })
                .then(data => {
                    if (data.message) {
                        const isDuplicate = data.message.toLowerCase().includes("already exists");

                        iziToast.show({
                            title: isDuplicate ? "Warning" : "Success",
                            message: data.message,
                            color: isDuplicate ? "orange" : "green",
                            position: "topRight"
                        });

                        if (!isDuplicate) {
                            const modalEl = document.getElementById("ruleFormModal");
                            if (modalEl) {
                                const modal = bootstrap.Modal.getInstance(modalEl);
                                if (modal) modal.hide();
                            }

                            this.reset();
                            loadFirewallRules();
                        }
                    } else {
                        throw new Error("Unexpected response from server");
                    }
                })
                .catch(error => {
                    iziToast.error({
                        title: 'Error',
                        message: error.message,
                        position: 'topRight'
                    });
                })
                .finally(() => {
                    $('#spinner').removeClass('show'); 
                });
        });
    }

    if (document.getElementById("ruleFirewallBody")) {
        loadFirewallRules();
    }

    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", function () {
            const ruleName = this.getAttribute("data-rule-name");

            const formData = new URLSearchParams();
            formData.append("ruleName", ruleName);

            $('#spinner').addClass('show'); 


            fetch('/api/rule/deletefirewall', {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            })
                .then(response => {
                    if (!response.ok) throw new Error("Delete failed");
                    return response.json();
                })
                .then(() => {
                    iziToast.success({
                        title: 'Deleted',
                        message: `"${ruleName}" was deleted successfully.`,
                        position: 'topRight'
                    });

                    const modalElement = document.getElementById("deleteRuleModal");
                    if (modalElement) {
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        if (modal) modal.hide();
                    }

                    loadFirewallRules();
                })
                .catch(error => {
                    iziToast.error({
                        title: 'Error',
                        message: error.message,
                        position: 'topRight'
                    });
                })
                .finally(() => {
                    $('#spinner').removeClass('show'); 
                });
        });
    }


    const confirmAllowFirewallBtn = document.getElementById("confirmAllowFirewallBtn");
    if (confirmAllowFirewallBtn) {
        confirmAllowFirewallBtn.addEventListener("click", function () {
            const ruleName = this.getAttribute("data-rule-name");

            const formData = new URLSearchParams();
            formData.append("ruleName", ruleName);

            $('#spinner').addClass('show'); 


            fetch('/api/rule/allowfirewall', {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData.toString()
            })
                .then(response => {
                    if (!response.ok) throw new Error("Delete failed");
                    return response.json();
                })
                .then(() => {
                    iziToast.success({
                        title: 'Deleted',
                        message: `"${ruleName}" was deleted successfully.`,
                        position: 'topRight'
                    });

                    const modalElement = document.getElementById("deleteRuleModal");
                    if (modalElement) {
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        if (modal) modal.hide();
                    }

                    loadFirewallRules();
                })
                .catch(error => {
                    iziToast.error({
                        title: 'Error',
                        message: error.message,
                        position: 'topRight'
                    });
                })
                .finally(() => {
                    $('#spinner').removeClass('show'); 
                });
        });
    }
});
