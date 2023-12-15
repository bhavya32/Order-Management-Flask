import os
from flask import Flask
from application.config import LocalDevelopmentConfig
from flask_sqlalchemy import SQLAlchemy
import flask_login
from application.database import db, socketio, login_manager
from flask_socketio import SocketIO

app = Flask(__name__, template_folder="templates")
app.config.from_object(LocalDevelopmentConfig)

# Set the secret key for session
app.secret_key = 'your_secret_key_here'

db.init_app(app)
login_manager.init_app(app)
socketio.init_app(app)
app.app_context().push()

# Import all the controllers so they are loaded
from application.controllers import *


if __name__ == '__main__':
  # Run the Flask app
  app.run(host='0.0.0.0',port=8080)
