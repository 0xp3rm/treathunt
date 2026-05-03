from main import socketio
import subprocess
import threading
import time


def check_ssh_service_status():
    last_status = None

    while True:
        try:
            result = subprocess.run(
                ["systemctl", "is-active", "ssh"],
                capture_output=True,
                text=True
            )

            if result.returncode == 0:
                current_status = result.stdout.strip()

                if current_status != last_status:
                    socketio.emit("ssh_status", {"status": current_status})
                    last_status = current_status
                    print(f"[SSH Status] {current_status}")
            else:
                current_status = result.stdout.strip() or "inactive"
                if current_status != last_status:
                    socketio.emit("ssh_status", {"status": current_status})
                    last_status = current_status
                    print(f"[SSH Status] {current_status}")

        except Exception as e:
            print("[SSH Status Exception]", str(e))

        time.sleep(2)


def start_background_thread():
    thread = threading.Thread(target=check_ssh_service_status)
    thread.daemon = True
    thread.start()


start_background_thread()