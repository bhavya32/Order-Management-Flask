from sqlalchemy.ext.declarative import declarative_base
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

engine = None
Base = declarative_base()
db = SQLAlchemy()

socketio = SocketIO(cors_allowed_origins="*")

from flask_login import LoginManager
login_manager = LoginManager()