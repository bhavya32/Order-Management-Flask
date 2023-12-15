from flask import Flask, request, redirect, url_for
from flask import render_template
from flask import current_app as app
from flask_login import current_user, login_required, login_user, logout_user
from .database import socketio, login_manager
from .dbFunctions import getActiveOrders, createNewOrder, getCreatorName, getOrderByID, getItemList, getOrderItems, getPartyList, getUser, weightUpdate
import json
import hashlib

@socketio.on('my event')
def handle_my_custom_event(json):
    print('received json: ' + str(json))

@login_manager.user_loader
def load_user(user_id):
    return getUser(user_id)

@login_manager.unauthorized_handler
def unauthorized():
    # do stuff
    return redirect(url_for('login'))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")
        
        # MD5 encrypt the password
        password = hashlib.md5(password.encode('utf-8')).hexdigest()
        
        user = getUser(username)
        if user != None and user.password == password:
            login_user(user, remember=True)
            return redirect(url_for('home'))
        else:
            return redirect(url_for('login'))
    return render_template("login.html")

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))


@app.route("/")
@login_required
def home():
    print(current_user.username)
    orders = getActiveOrders()
    o = []
    for order in orders:
        entry = {}
        entry["orderID"] = order.orderID
        entry["partyName"] = order.partyName
        entry["timestamp"] = order.timestamp
        entry["creator"] = getCreatorName(order.creator)
        count = 0
        orderitems = getOrderItems(order.orderID)
        for i in orderitems:
            if i.weight != None:
                count += 1
        entry["status"] = str(count) + "/" + str(len(orderitems))
        o.append(entry)
    return render_template("index.html", orders = o)


@app.route("/create")
@login_required
def create():
    orders = getActiveOrders()
    r = []
    for order in orders:
        entry = {}
        entry["orderID"] = order.orderID
        entry["partyName"] = order.partyName
        entry["timestamp"] = order.timestamp
        count = 0
        orderitems = getOrderItems(order.orderID)
        for i in orderitems:
            if i.weight != None:
                count += 1
        entry["status"] = str(count) + "/" + str(len(orderitems))
        r.append(entry)
    return render_template("create.html",orders=r)

@app.route("/get_item_names")
def get_item_names():
    return [item.itemName for item in getItemList()]

@app.route("/get_party_names")
def get_party_names():
    return [party.partyName for party in getPartyList()]

@app.route("/get_order_items/<int:orderID>")
def get_order_items(orderID):
    orderItems = getOrderItems(orderID)
    r = []
    for item in orderItems:
        entry = {}
        entry["itemName"] = item.itemName
        entry["itemDesc"] = item.itemDesc
        entry["itemQty"] = item.itemQty
        entry["itemUnit"] = item.itemUnit
        entry["itemID"] = item.itemID
        entry["weight"] = item.weight
        entry["weightOld"] = item.weightOld
        r.append(entry)
    s = {"orderItems": r}
    o =getOrderByID(orderID)
    s["partyName"] = o.partyName
    return json.dumps(s)
@app.route("/create_order", methods=["POST"])
@login_required
def create_order():
    data = request.get_json()
    partyName = data["partyName"]
    orderItems = data["orderItems"]
    # order = getOrderByID(createNewOrder(partyName, orderItems))
    orderId = createNewOrder(partyName, orderItems)
    #print(partyName, orderItems)
    return {"orderID": orderId}
    # return redirect(url_for('order', orderID=order.orderID))


@app.route("/order/<int:orderID>", methods=["GET"])
@login_required
def order(orderID):
    order = getOrderByID(orderID)
    orderItems = getOrderItems(orderID)
    return render_template("order.html", order=order, orderItems=orderItems)

@app.route("/print_order/<int:orderID>", methods=["GET"])
@login_required
def print_order(orderID):
    #order = getOrderByID(orderID)
    #orderItems = getOrderItems(orderID)
    return {"result": "Print Queued"}

@app.route("/weight/<int:itemID>/<int:weight>")
def insert_weight(itemID, weight):
    orderID, itemName = weightUpdate(itemID, weight)
    partyName = getOrderByID(orderID).partyName
    return {"result": "success", "partyName":partyName, "itemName":itemName}

@app.route("/weight/<int:weight>")
def insert_weight_unknown(weight):
    #save the weight somewhere
    return {"result": "success", "weight":weight}
