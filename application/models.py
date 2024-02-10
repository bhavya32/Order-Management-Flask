from flask_login import UserMixin
from .database import db

class Order(db.Model):
    __tablename__ = 'order'

    orderID = db.Column(db.Integer, primary_key=True)
    partyName = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.Integer, nullable=False, server_default=db.FetchedValue())
    creator = db.Column(db.ForeignKey('users.userID'), nullable=False)
    status = db.Column(db.Integer, nullable=False)
    user = db.relationship('User', primaryjoin='Order.creator == User.userID', backref='orders')


class OrderItem(db.Model):
    __tablename__ = 'orderItems'
    itemID = db.Column(db.Integer, primary_key=True)
    itemName = db.Column(db.Text, nullable=False)
    itemQty = db.Column(db.Text, nullable=False)
    itemUnit = db.Column(db.Text, nullable=False)
    orderID = db.Column(db.ForeignKey('order.orderID'), nullable=False)
    itemDesc = db.Column(db.Text)
    order = db.relationship('Order', primaryjoin='OrderItem.orderID == Order.orderID', backref='order_items')



class User(db.Model, UserMixin):
    __tablename__ = 'users'
    userID = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.Text, nullable=False, unique=True)
    password = db.Column(db.Text, nullable=False)
    authority = db.Column(db.Integer, nullable=False)
    def get_id(self):
           return (self.username)


class ItemList(db.Model):
    __tablename__ = 'itemList'
    itemID = db.Column(db.Integer, primary_key=True)
    itemName = db.Column(db.Text, nullable=False, unique=True)
    itemLoc = db.Column(db.Integer, nullable=False)

class PartyList(db.Model):
    __tablename__ = 'partyList'
    partyName = db.Column(db.Text, primary_key=True, nullable=False)
    mobile = db.Column(db.Integer, nullable=False)

class WeightList(db.Model):
    __tablename__ = 'weightList'
    wid = db.Column(db.Integer, primary_key=True)
    itemID = db.Column(db.ForeignKey('orderItems.itemID'))
    weight = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.Integer, nullable=False, server_default=db.FetchedValue())