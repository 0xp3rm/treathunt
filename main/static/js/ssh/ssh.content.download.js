function download_ssh_anomaly() {
    const getCurrentDate = new Date().toISOString();
    const element = document.getElementById("ssh-anomaly-log-body");

    if (element.querySelectorAll("td").length === 0) {
        iziToast.warning({
            title: 'Warning',
            message: 'SSH logs is empty',
            position: 'topRight',
            timeout: 5000,
            transitionIn: 'fadeInDown',
            transitionOut: 'fadeOutUp',
            icon: 'fa fa-exclamation-circle'
        });
        return;
    }

    const filename = prompt("Save file as", `SSH ANOMALY (${new Date().toLocaleString()})`);
    if (!filename) return;

    const originalColor = element.style.color;
    const originalBg = element.style.backgroundColor;

    element.style.color = "#000000";
    element.style.backgroundColor = "#ffffff";

    html2pdf().set({
        filename: filename + ".pdf",
        html2canvas: {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: true
        },
        jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait'
        }
    })
        .from(element)
        .save()
        .then(() => {
            element.style.color = originalColor;
            element.style.backgroundColor = originalBg;
        });
}


function download_ssh_attempt() {
    const getCurrentDate = new Date().toISOString();
    const element = document.getElementById("ssh-attempt-log-body");

    if (element.querySelectorAll("td").length === 0) {
        iziToast.warning({
            title: 'Warning',
            message: 'SSH logs is empty',
            position: 'topRight',
            timeout: 5000,
            transitionIn: 'fadeInDown',
            transitionOut: 'fadeOutUp',
            icon: 'fa fa-exclamation-circle'
        });
        return;
    }

    const filename = prompt("Save file as", `SSH ATTEMPT (${new Date().toLocaleString()})`);
    if (!filename) return;

    const originalColor = element.style.color;
    const originalBg = element.style.backgroundColor;

    // Hide buttons
    const buttons = element.querySelectorAll("button");
    buttons.forEach(btn => btn.style.display = "none");

    // Set readable colors for the PDF
    element.style.color = "#000000";
    element.style.backgroundColor = "#ffffff";

    const tds = element.querySelectorAll("td");

    // Save original styles for each <td>
    const tdOriginalStyles = Array.from(tds).map(td => ({
        color: td.style.color,
        backgroundColor: td.style.backgroundColor
    }));

    // Apply black text and white background
    tds.forEach(td => {
        td.style.color = "#000000";
        td.style.backgroundColor = "#ffffff";
    });

    // Apply padding-left to "fail-count" cells (move right)
    const failCountCells = element.querySelectorAll("td.fail-count");
    const originalFailCountStyles = Array.from(failCountCells).map(td => ({
        paddingLeft: td.style.paddingLeft
    }));
    failCountCells.forEach(td => {
        td.style.paddingLeft = "20px"; 
    });

    html2pdf().set({
        filename: filename + ".pdf",
        html2canvas: {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: true
        },
        jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait'
        }
    })
        .from(element)
        .save()
        .then(() => {
            // Restore button visibility
            buttons.forEach(btn => btn.style.display = "");

            // Restore element styles
            element.style.color = originalColor;
            element.style.backgroundColor = originalBg;

            // Restore <td> styles
            tds.forEach((td, i) => {
                td.style.color = tdOriginalStyles[i].color;
                td.style.backgroundColor = tdOriginalStyles[i].backgroundColor;
            });

            // Restore fail-count cell padding
            failCountCells.forEach((td, i) => {
                td.style.paddingLeft = originalFailCountStyles[i].paddingLeft;
            });
        });
}


function download_ssh_allow() {
    const getCurrentDate = new Date().toISOString();
    const element = document.getElementById("ssh-allow-ip-rule");

    if (element.querySelectorAll("td").length === 0) {
        iziToast.warning({
            title: 'Warning',
            message: 'SSH allowlist is empty',
            position: 'topRight',
            timeout: 5000,
            transitionIn: 'fadeInDown',
            transitionOut: 'fadeOutUp',
            icon: 'fa fa-exclamation-circle'
        });
        return;
    }

    const filename = prompt("Save file as", `SSH ALLOWLIST (${new Date().toLocaleString()})`);
    if (!filename) return;

    const originalColor = element.style.color;
    const originalBg = element.style.backgroundColor;

    const buttons = element.querySelectorAll("button");
    buttons.forEach(btn => btn.style.display = "none");

    element.style.color = "#000000";
    element.style.backgroundColor = "#ffffff";

    const tds = element.querySelectorAll("td");
    const tdOriginalStyles = Array.from(tds).map(td => ({
        color: td.style.color,
        backgroundColor: td.style.backgroundColor
    }));
    tds.forEach(td => {
        td.style.color = "#000000";
        td.style.backgroundColor = "#ffffff";
    });

    html2pdf().set({
        filename: filename + ".pdf",
        html2canvas: {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: true
        },
        jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait'
        }
    })
        .from(element)
        .save()
        .then(() => {
            buttons.forEach(btn => btn.style.display = "");

            element.style.color = originalColor;
            element.style.backgroundColor = originalBg;

            tds.forEach((td, i) => {
                td.style.color = tdOriginalStyles[i].color;
                td.style.backgroundColor = tdOriginalStyles[i].backgroundColor;
            });
        });
}


function download_ssh_block() {
    const getCurrentDate = new Date().toISOString();
    const element = document.getElementById("ssh-block-ip-rule");

    if (element.querySelectorAll("td").length === 0) {
        iziToast.warning({
            title: 'Warning',
            message: 'SSH blocklist is empty',
            position: 'topRight',
            timeout: 5000,
            transitionIn: 'fadeInDown',
            transitionOut: 'fadeOutUp',
            icon: 'fa fa-exclamation-circle'
        });
        return;
    }

    const filename = prompt("Save file as", `SSH BLOCKLIST (${new Date().toLocaleString()})`);
    if (!filename) return;

    const originalColor = element.style.color;
    const originalBg = element.style.backgroundColor;

    const buttons = element.querySelectorAll("button");
    buttons.forEach(btn => btn.style.display = "none");

    element.style.color = "#000000";
    element.style.backgroundColor = "#ffffff";

    const tds = element.querySelectorAll("td");
    const tdOriginalStyles = Array.from(tds).map(td => ({
        color: td.style.color,
        backgroundColor: td.style.backgroundColor
    }));
    tds.forEach(td => {
        td.style.color = "#000000";
        td.style.backgroundColor = "#ffffff";
    });

    html2pdf().set({
        filename: filename + ".pdf",
        html2canvas: {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: true
        },
        jsPDF: {
            unit: 'in',
            format: 'letter',
            orientation: 'portrait'
        }
    })
        .from(element)
        .save()
        .then(() => {
            buttons.forEach(btn => btn.style.display = "");

            element.style.color = originalColor;
            element.style.backgroundColor = originalBg;

            tds.forEach((td, i) => {
                td.style.color = tdOriginalStyles[i].color;
                td.style.backgroundColor = tdOriginalStyles[i].backgroundColor;
            });
        });
}