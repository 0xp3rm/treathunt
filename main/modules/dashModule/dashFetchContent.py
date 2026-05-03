import requests
from flask import Blueprint, jsonify, request
from main.models import RemoteIP, User, SSHLog, db
from sqlalchemy import func


dashboard_view_bp = Blueprint("dashboard_view_bp", __name__)


@dashboard_view_bp.route("/info", methods=["GET"])
def get_dashboard_stats():
    try:
        user_count = db.session.query(User).count()
        ip_count = db.session.query(RemoteIP).count()
        ssh_log_count = db.session.query(func.sum(SSHLog.ip_fail_count)).scalar() or 0
        ssh_ip_count = db.session.query(SSHLog.ip_address).count()

        # Get list of all SSH logs with IP and fail count
        ssh_log_details = db.session.query(
            SSHLog.ip_address, SSHLog.ip_fail_count
        ).all()

        ssh_log_array = [
            {"ip_address": ip, "ip_fail_count": fail_count}
            for ip, fail_count in ssh_log_details
        ]

        return jsonify(
            {
                "user_count": user_count,
                "ip_count": ip_count,
                "ssh_log_count": ssh_log_count,
                "ssh_ip_count": ssh_ip_count,
                "ssh_logs": ssh_log_array,
            }
        )
    except Exception as e:
        return jsonify({"error": "Failed to retrieve stats", "details": str(e)}), 500


@dashboard_view_bp.route("/remoteip", methods=["GET"])
def getNetTCPRemoteIP():
    getRemoteIP = RemoteIP.query.all()

    IPresult = [{"ip_address": ip.ip_address} for ip in getRemoteIP]

    return jsonify(IPresult)

@dashboard_view_bp.route("/lookup/<ip>", methods=["GET"])
def getLookUpIpdetails(ip):
    try:
        url = f"http://ip-api.com/json/{ip}"
        response = requests.get(url, timeout=5)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        status_code = e.response.status_code if e.response else 500
        error_text = e.response.text if e.response else str(e)
        print(f"Error: {status_code} - {error_text}")
        return jsonify({"message": "Failed", "debug": error_text}), status_code

@dashboard_view_bp.route("/delete", methods=["DELETE"])
def delete_remote_ip():
    ip = request.form.get("ip")
    if not ip:
        return jsonify({"message": "Missing IP parameter"}), 400

    ip_entry = RemoteIP.query.filter_by(ip_address=ip).first()
    if not ip_entry:
        return jsonify({"message": "IP not found"}), 404

    db.session.delete(ip_entry)
    db.session.commit()
    return jsonify({"message": f"IP {ip} deleted successfully"}), 200


@dashboard_view_bp.route("/clear", methods=["POST"])
def clear_all_remote_ips():
    try:
        deletedRemoteIP = RemoteIP.query.delete()
        db.session.commit()
        return jsonify({"message": f"All IP records deleted successfully)"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"message": "Failed to clear IP records", "error": str(e)}), 500
