const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new URLSearchParams(new FormData(loginForm));

        try {
            const res = await fetch("/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok && data.success) {
                window.location.href = "/dash/board";
            } else {
                iziToast.error({
                    title: "Error",
                    message: data.message,
                    position: "topCenter"
                });
            }
        } catch (err) {
            iziToast.error({
                title: "Error",
                message: "An unexpected error occurred.",
                position: "topCenter"
            });
        }
    });
}

const forgotPasswordForm = document.getElementById("forgotPasswordForm");
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const form = new FormData(this);
        const formData = new URLSearchParams(form);

        try {
            const res = await fetch("/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                iziToast.success({
                    title: "Success",
                    message: data.message || "Password reset successful.",
                    position: "topCenter"
                });

                setTimeout(() => showForm("loginFormWrapper"), 1500);
            } else {
                iziToast.error({
                    title: "Error",
                    message: data.error || "Something went wrong.",
                    position: "topCenter"
                });
            }
        } catch (err) {
            iziToast.error({
                title: "Error",
                message: "Server error. Please try again.",
                position: "topRight"
            });
        }
    });
}

const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const form = e.target;
        const formData = new FormData(form);

        const data = {
            registerUsername: formData.get("registerUsername"),
            registerPassword: formData.get("registerPassword"),
            registerConfirm: formData.get("registerConfirm"),
        };

        try {
            const response = await fetch("/register", {
                method: "POST",
                body: new URLSearchParams(data),
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const result = await response.json();

            if (!response.ok) {
                iziToast.error({
                    title: "Error",
                    message: result.error || "Something went wrong",
                    position: "topCenter"
                });
            } else {
                iziToast.success({
                    title: "Success",
                    message: result.message,
                    position: "topCenter"
                });

                form.reset();
                showForm("loginFormWrapper");
            }
        } catch (err) {
            iziToast.error({
                title: "Network Error",
                message: "Failed to send request",
                position: "topCenter"
            });
        }
    });
}
