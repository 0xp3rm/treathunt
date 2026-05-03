import threading
from main.modules.connectionModule.connection_tcp import monitor_tcp_connections

_thread_started = False


def start_connection_threads():
    global _thread_started
    if not _thread_started:
        print("[Connection Thread] Starting CONNECTION monitoring thread...")
        threading.Thread(target=monitor_tcp_connections, daemon=True).start()
        _thread_started = True


start_connection_threads()
