from flask import Blueprint, render_template, session, redirect, url_for

homeRoute_bp = Blueprint("homeRoute_bp", __name__)


@homeRoute_bp.route("/board", methods=["GET", "POST"])
@homeRoute_bp.route("/rules", methods=["GET"])
@homeRoute_bp.route("/connection", methods=["GET"])
@homeRoute_bp.route("/sysinfo", methods=["GET"])
@homeRoute_bp.route("/about", methods=["GET"])
@homeRoute_bp.route("/profile", methods=["GET", "POST"])
@homeRoute_bp.route("/ssh")
def show_dashboard():
    if session.get("logged_in"):
        return render_template("index.html")
    else:
        return redirect(url_for("auth_bp.get_signin_page")), 302
