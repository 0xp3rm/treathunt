function clear_ssh_log() {
    fetch('/api/ssh/clear', {
        method: "POST"
    })
        .then(response => {
            if (!response.ok) throw new Error("Failed to clear ssh logs");
            return response.json();
        })
        .then(data => {
            if (data.success) {
                iziToast.success({
                    title: 'Success',
                    message: data.success,
                    position: 'topRight'
                });
            } else if (data.message) {
                iziToast.success({
                    title: 'Success',
                    message: data.message,
                    position: 'topRight'
                });
            } else if (data.error) {
                iziToast.error({
                    title: 'Error',
                    message: data.error,
                    position: 'topRight'
                });
            }
        })
        .catch(error => {
            iziToast.error({
                title: 'Error',
                message: error.message,
                position: 'topRight'
            });
        });
}