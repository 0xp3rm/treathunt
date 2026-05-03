from flask import Blueprint, jsonify, request
import subprocess

connection_handling_bp = Blueprint("connection_handling_bp", __name__)


@connection_handling_bp.route("/getpid", methods=["POST"])
def getPIDofConnection():
    datapid = request.form.get("pid")

    if not datapid:
        return jsonify({"error": "No PID provided"}), 400

    try:
        pid = int(datapid)

        # Read process name from /proc
        try:
            with open(f"/proc/{pid}/comm", "r") as f:
                process_name = f.read().strip()
        except FileNotFoundError:
            return jsonify({"error": f"Process with PID {pid} not found"}), 404

        return jsonify({"process_name": process_name})

    except ValueError:
        return jsonify({"error": "Invalid PID"}), 400
    except Exception as e:
        return jsonify({"error": f"Internal server error: {e}"}), 500
