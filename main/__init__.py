import os
import sys
from flask import Flask, session, Blueprint, jsonify
from flask_session import Session
from flask_socketio import SocketIO
from .models import db

# Initialize extensions globally
server_session = Session()
socketio = SocketIO(
    cors_allowed_origins="*",
    async_mode="gevent",
    logger=True,         
    engineio_logger=True 
)


def create_app():
    app = Flask(__name__)

    # Detect if running from PyInstaller .exe
    if getattr(sys, "frozen", False):
        # If frozen, use directory of the executable
        basedir = os.path.dirname(sys.executable)
    else:
        basedir = os.path.abspath(os.path.dirname(__file__))

    # Persistent instance paths
    instance_path = os.path.join(basedir, "instance")
    os.makedirs(instance_path, exist_ok=True)
    session_dir = os.path.join(instance_path, "flask_session")
    os.makedirs(session_dir, exist_ok=True)

    app.config["SECRET_KEY"] = "your-secret-key"

    app.config["SESSION_TYPE"] = "filesystem"
    app.config["SESSION_FILE_DIR"] = session_dir
    app.config["SESSION_PERMANENT"] = False
    app.config["SESSION_USE_SIGNER"] = True
    app.config["SESSION_COOKIE_HTTPONLY"] = True
    app.config["SESSION_COOKIE_SECURE"] = False
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
    app.config["SESSION_REFRESH_EACH_REQUEST"] = True

    server_session.init_app(app)

    @app.context_processor
    def inject_user():
        return dict(
            logged_in=session.get("logged_in"), username=session.get("username")
        )

    # Database setup (persistent)
    db_path = os.path.join(instance_path, "user.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)

    with app.app_context():
        db.create_all()

    # Blueprints & Modules
    from .routes.auth import auth_bp
    from .routes.homeRoute import homeRoute_bp
    from .modules.dashModule.dashFetchContent import dashboard_view_bp
    from .modules.userProfileModule.getUserInfo import get_User_profile_bp
    from .modules.userProfileModule.updateUserProfile import update_profile_bp
    from .modules.userProfileModule.uploadProfile import myprofile_bp
    from .modules.ruleModule.ruleFirewallHandle import rules_firewall_handler_bp
    from .modules.connectionModule import connection_tcp
    from .modules.connectionModule.connectionHandling import connection_handling_bp
    from .modules.sysinfoModule.sysinfo import sysinfo_blueprint
    from main.modules.sshModule import ssh_status_emitter, ssh_logger_websocket
    from main.modules.sshModule.sshFirewallHandling.ssh_firewall_rule_route import (
        ssh_firewall_handler,
    )
    from main.modules.sshModule.sshFirewallHandling.ssh_firewall_grab_rule import (
        ssh_firewall_get_allow_block_rule_bp,
    )
    from .modules.connectionModule.connectionThread import start_connection_threads

    app.register_blueprint(auth_bp, url_prefix="/")
    app.register_blueprint(homeRoute_bp, url_prefix="/dash")

    api_bp = Blueprint("api", __name__)

    @api_bp.before_request
    def require_login():
        if not session.get("logged_in"):
            return jsonify({"error": "Unauthorized"}), 401

    api_bp.register_blueprint(dashboard_view_bp, url_prefix="/board")
    api_bp.register_blueprint(ssh_firewall_handler, url_prefix="/ssh")
    api_bp.register_blueprint(ssh_firewall_get_allow_block_rule_bp, url_prefix="/ssh")
    api_bp.register_blueprint(connection_handling_bp, url_prefix="/connection")
    api_bp.register_blueprint(rules_firewall_handler_bp, url_prefix="/rule")
    api_bp.register_blueprint(sysinfo_blueprint)
    api_bp.register_blueprint(myprofile_bp, url_prefix="/profile")
    api_bp.register_blueprint(get_User_profile_bp)
    api_bp.register_blueprint(update_profile_bp, url_prefix="/profile")
    app.register_blueprint(api_bp, url_prefix="/api")

    socketio.init_app(app)

    if not os.environ.get('WERKZEUG_RUN_MAIN') == 'true': 
        if not hasattr(app, 'log_thread_started'):
            ssh_logger_websocket.start_log_thread(app)
            app.log_thread_started = True

    return app
