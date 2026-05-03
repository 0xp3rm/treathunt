import uuid
import os
from flask import Blueprint, request, jsonify, session
from werkzeug.utils import secure_filename
from main.models import db, User

myprofile_bp = Blueprint("myprofile_bp", __name__)


@myprofile_bp.route("/upload", methods=["POST"])
def UploadFile():
    username = session.get("username")
    if not username:
        return jsonify({"error": "Unauthorized"}), 401

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if request.method == "POST":
        file = request.files["profile_pic"]

        if file:
            # Save original filename extension
            ext = os.path.splitext(secure_filename(file.filename))[1] or ".jpg"
            unique_filename = f"{uuid.uuid4()}{ext}"

            user.profile_pic = file.read()
            user.profile_pic_filename = unique_filename
            user.pic_mime = file.mimetype
            db.session.commit()

            # update session with unique filename used in DB
            session["profile_pic_filename"] = unique_filename

        return (
            jsonify(
                {
                    "message": "Profile picture uploaded successfully.",
                    "filename": unique_filename,
                }
            ),
            201,
        )


@myprofile_bp.route("/delete", methods=["DELETE"])
def deleteProfilePicture():
    username = session.get("username")
    if not username:
        return jsonify({"error": "Unauthorized"}), 401

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if not user.profile_pic or not user.profile_pic_filename:
        return jsonify({"error": "No profile picture to delete."}), 404

    user.profile_pic = None
    user.profile_pic_filename = None
    user.pic_mime = None

    db.session.commit()

    return jsonify({"message": "Profile picture deleted successfully."}), 200
