let summaryChart, sshChart;

async function loadData() {
    try {
        const summaryCanvas = document.getElementById('summaryChart');
        const sshCanvas = document.getElementById('sshChart');

        if (!summaryCanvas && !sshCanvas) {
            return;
        }

        const response = await fetch("/api/board/info");
        const data = await response.json();

        if (!summaryChart) {
            const ctx1 = document.getElementById('summaryChart').getContext('2d');
            summaryChart = new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: ['TCP IP', 'SSH Failed IP', 'SSH Attempts'],
                    datasets: [{
                        label: '',
                        data: [data.ip_count, data.ssh_ip_count, data.ssh_log_count],
                        fill: true,
                        borderColor: '#4e79a7',
                        backgroundColor: 'rgba(78, 121, 167, 0.3)',
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'Dashboard Chart' }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    scales: {
                        x: { stacked: true },
                        y: {
                            beginAtZero: true,
                            stacked: true,
                            ticks: { display: false },
                            grid: { drawTicks: false }
                        }
                    }
                }
            });
        } else {
            summaryChart.data.datasets[0].data = [
                data.ip_count, data.ssh_ip_count, data.ssh_log_count
            ];
            summaryChart.update();
        }


        // === Chart 2: SSH Logs by IP ===
        if (!sshChart) {
            const ctx2 = document.getElementById('sshChart').getContext('2d');
            sshChart = new Chart(ctx2, {
                type: 'bar',
                data: {
                    labels: data.ssh_logs.map(log => log.ip_address),
                    datasets: [{
                        label: 'Failed Attempts',
                        data: data.ssh_logs.map(log => log.ip_fail_count),
                        backgroundColor: '#e15759'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: { display: true, text: 'SSH IP Attempts' }
                    },
                    scales: { y: { beginAtZero: true } }
                }
            });
        } else {
            sshChart.data.labels = data.ssh_logs.map(log => log.ip_address);
            sshChart.data.datasets[0].data = data.ssh_logs.map(log => log.ip_fail_count);
            sshChart.update();
        }


    } catch (error) {
        console.error("Error loading API data:", error);
    }
}


loadData();

setInterval(loadData, 5000);