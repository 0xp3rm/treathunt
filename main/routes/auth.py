import os
from flask import (
    Blueprint,
    render_template,
    request,
    redirect,
    session,
    jsonify,
    make_response,
    current_app,
)
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
from main.models import db, User

auth_bp = Blueprint("auth_bp", __name__)


@auth_bp.route("/", methods=["GET"])
def get_signin_page():
    session.clear()
    return render_template("signin.html")


@auth_bp.route("/login", methods=["POST"])
def login_handler():
    username = request.form.get("username")
    password = request.form.get("password")

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password, password):
        session["user_id"] = user.id
        session["username"] = user.username
        session["profile_pic_filename"] = user.profile_pic_filename
        session["logged_in"] = True
        return jsonify({"success": True})

    return jsonify({"success": False, "message": "Invalid username or password"}), 401


@auth_bp.route("/register", methods=["POST"])
def registerUser():
    registerUsername = request.form.get("registerUsername")
    registerPassword = request.form.get("registerPassword")
    registerConfirm = request.form.get("registerConfirm")

    if registerPassword != registerConfirm:
        return jsonify({"error": "Password doesn't match"}), 400

    is_user_exist = User.query.filter_by(username=registerUsername).first()

    if is_user_exist:
        return jsonify({"message": "Registered Successfully"}), 201

    hash_password = generate_password_hash(registerPassword)
    new_user = User(username=registerUsername, password=hash_password)

    db.session.add(new_user)
    db.session.commit()

    return jsonify({"message": "Registered Successfully"}), 201


@auth_bp.route("/reset-password", methods=["POST"])
def resetPassword():
    userPassphrase = request.form.get("passphrase")
    username = request.form.get("username")
    newPassword = request.form.get("new-password")
    confirmPassword = request.form.get("confirm-password")

    if userPassphrase is None:
        return jsonify({"error": "No passphrase provided"}), 400

    if newPassword != confirmPassword:
        return jsonify({"error": "Passwords do not match"}), 400

    user = User.query.filter_by(username=username, passphrase=userPassphrase).first()

    if not user:
        print(user)
        return jsonify({"error": "Invalid username or passphrase"}), 401

    # Hash the new password and update it
    user.password = generate_password_hash(newPassword)
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200
