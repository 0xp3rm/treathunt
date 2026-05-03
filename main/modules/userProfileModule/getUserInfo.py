from flask import Blueprint, jsonify, redirect, session
from main.models import User

from flask import send_file
from io import BytesIO

get_User_profile_bp = Blueprint("get_User_Profile", __name__)


@get_User_profile_bp.route("/profile", methods=["GET"])
def getUserInfo():
    username = session.get("username")
    user = User.query.get(session["user_id"])

    if not username:
        return redirect("/")

    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user:
        session["profile_pic_filename"] = user.profile_pic_filename

    return jsonify(
        {
            "username": user.username,
            "passphrase": user.passphrase,
            "pic_name": user.profile_pic_filename,
        }
    )


@get_User_profile_bp.route("/profile/image/<filename>", methods=["GET"])
def getProfileImage(filename):
    user = User.query.filter_by(profile_pic_filename=filename).first()

    if not user or not user.profile_pic or not user.pic_mime:
        return redirect("/static/images/default-image.jpg")

    return send_file(
        BytesIO(user.profile_pic), mimetype=user.pic_mime, as_attachment=False
    )
