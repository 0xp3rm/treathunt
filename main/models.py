from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(50))
    passphrase = db.Column(db.String(50))
    profile_pic = db.Column(db.LargeBinary)
    pic_mime = db.Column(db.String(50))
    profile_pic_filename = db.Column(db.String(100))


class ruleFirewall(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ruleName = db.Column(db.String(50))
    ruleDirection = db.Column(db.String(50))
    ruleProtocol = db.Column(db.String(50))
    ruleAction = db.Column(db.String(50))
    ruleLocalPort = db.Column(db.String(50))
    ruleRemotePort = db.Column(db.String(50))
    ruleRemoteAddress = db.Column(db.String(50))


class RemoteIP(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(50), unique=True, nullable=False)


class SSHLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ip_address = db.Column(db.String(50), unique=True, nullable=False)
    ip_fail_count = db.Column(db.Integer, default=0)