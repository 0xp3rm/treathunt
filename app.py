from gevent import monkey
monkey.patch_all()

import geventwebsocket
from main import create_app, socketio

app = create_app()

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=1337, debug=True, use_reloader=False)