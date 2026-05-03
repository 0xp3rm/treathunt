from flask import Blueprint, request, session, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from main.models import db, User

update_profile_bp = Blueprint("update_profile_bp", __name__)


@update_profile_bp.route("/reset-password", methods=["POST"])
def updatePassword():
    oldPassword = request.form.get("old-password")
    newPassword = request.form.get("new-password")
    confirmPassword = request.form.get("confirm-password")

    if newPassword != confirmPassword:
        return jsonify({"error": "New passwords do not match"}), 400

    if newPassword == oldPassword or confirmPassword == oldPassword:
        return (
            jsonify(
                {"error": "New password should not be the same as the old password"}
            ),
            400,
        )

    username = session.get("username")
    if not username:
        return jsonify({"error": "User not logged in"}), 401

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check old password
    if not check_password_hash(user.password, oldPassword):
        return jsonify({"error": "Old password is incorrect"}), 403

    # Hash and update new password
    user.password = generate_password_hash(newPassword)
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200


@update_profile_bp.route("/passphrase", methods=["POST"])
def updatePassphrase():
    newPassphrase = request.form.get("new-passphrase")
    confirmPassphrase = request.form.get("confirm-passphrase")

    if newPassphrase != confirmPassphrase:
        return jsonify({"message": "Passphrases do not match"}), 400

    username = session.get("username")
    if not username:
        return jsonify({"User not logged in"}), 401

    user = User.query.filter_by(username=username).first()
    if not user:
        return "User not found", 404

    user.passphrase = newPassphrase
    db.session.commit()

    return jsonify({"message": f"Passphrase updated successfully."})
