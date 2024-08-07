import datetime
from flask import Flask, request, redirect, url_for
from flask import render_template
from flask import current_app as app
from flask_login import current_user, login_required, login_user, logout_user
from .database import socketio, login_manager
from .dbFunctions import addOrderItems, changeOrderStatus, deleteOrderItem, deleteWeight, getActiveOrders, createNewOrder, getCreatorName, getItemWeight, getOrderByID, getItemList, getOrderItems, getPartyList, getUser, itemFlip, splitOrderItems, updatePrice, weightUpdate
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
        entry["timestamp"] = datetime.datetime.fromisoformat(order.timestamp) + datetime.timedelta(hours=5, minutes=30)
        entry["creator"] = getCreatorName(order.creator)
        count = 0
        orderitems = getOrderItems(order.orderID)
        for i in orderitems:
            if getItemWeight(i.itemID) != []:
                count += 1
        entry["status"] = str(count) + "/" + str(len(orderitems))
        o.append(entry)
    return render_template("index.html", orders = o)


@app.route("/create")
@login_required
def create():
    return render_template("create.html")

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
        wlist = [{"wid": x.wid, "weight":x.weight, "timestamp":x.timestamp} for x in getItemWeight(item.itemID)]
        entry = {}
        entry["itemName"] = item.itemName
        entry["itemDesc"] = item.itemDesc
        entry["itemQty"] = item.itemQty
        entry["itemUnit"] = item.itemUnit
        entry["itemID"] = item.itemID
        entry["rate"] = item.price
        entry["weight"] = 0
        entry["weightOld"] = 0
        entry["weightList"] = wlist
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

@app.route("/modify_order", methods=["POST"])
@login_required
def modify_order():
    data = request.get_json()
    orderID = data["orderID"]
    orderItems = data["orderItems"]
    # order = getOrderByID(createNewOrder(partyName, orderItems))
    addOrderItems(orderID, orderItems)
    #print(partyName, orderItems)
    return {"orderID": orderID}
    # return redirect(url_for('order', orderID=order.orderID))

@app.route("/delete_order_item/<int:itemID>", methods=["GET"])
@login_required
def delete_order_item(itemID):
    deleteOrderItem(itemID)
    return {"result": "success"}

@app.route("/order/<int:orderID>", methods=["GET"])
@login_required
def order(orderID):
    order = getOrderByID(orderID)
    orderItems = getOrderItems(orderID)
    return render_template("order.html", order=order, orderItems=orderItems)

@app.route("/modifyOrder/<int:orderID>", methods=["GET"])
@login_required
def modifyOrder(orderID):
    order = getOrderByID(orderID)
    orderItems = getOrderItems(orderID)
    return render_template("modifyOrder.html", order=order, orderItems=orderItems)


@app.route("/modify_price", methods=["POST"])
@login_required
def modify_price():
    data = request.get_json()
    #print(data)
    for key in data:
        try:
            updatePrice(int(key), data[key])
        except:
            pass

    return {"result": "success"}
    # return redirect(url_for('order', orderID=order.orderID))


@app.route("/modifyPrice/<int:orderID>", methods=["GET"])
@login_required
def modifyPrice(orderID):
    order = getOrderByID(orderID)
    orderItems = getOrderItems(orderID)
    return render_template("modifyPrice.html", order=order, orderItems=orderItems)


@app.route("/print_order/<int:orderID>", methods=["GET"])
@login_required
def print_order(orderID):
    order = getOrderByID(orderID)
    orderItems = getOrderItems(orderID)
    orderItemsSplit = splitOrderItems(orderItems)
    ois = []
    for items in orderItemsSplit[0]:
        ois.append({"itemID":items.itemID, "itemName": items.itemName, "itemQty": items.itemQty, "itemUnit": items.itemUnit, "itemDesc":items.itemDesc})
    socketio.emit('print', {'orderID': orderID, 'partyName': order.partyName, 'orderItems': ois})
    
    #time delay of 3 second
    socketio.sleep(3)
    ois = []
    for items in orderItemsSplit[1]:
        ois.append({"itemID":items.itemID, "itemName": items.itemName, "itemQty": items.itemQty, "itemUnit": items.itemUnit, "itemDesc":items.itemDesc})
    if ois != []:
        socketio.emit('print', {'orderID': orderID, 'partyName': order.partyName, 'orderItems': ois})
    return {"result": "Print Queued"}

@app.route("/weight/<int:itemID>/<int:weight>")
def insert_weight(itemID, weight):
    itemID = itemID//10 #note: apparently barcode scanner adds a random digit, so we remove it here
    status, orderID, itemName = weightUpdate(itemID, weight)
    if not status:
        print("item id deleted but weight updated")
        return {"result":"error"}
    partyName = getOrderByID(orderID).partyName
    socketio.emit('update', {'reason': "weightUpdate", 'code':0, 'title':f"Order #{orderID}", 'message':f"{itemName} - {weight}"})
    return {"result": "success", "partyName":partyName, "itemName":itemName}

@app.route("/weight/NA/<int:weight>")
def insert_weight_unknown(weight):
    #save the weight somewhere
    print(weight)
    return {"result": "success", "weight":weight}

@app.route("/complete/<int:orderID>")
@login_required
def complete_order(orderID):
    changeOrderStatus(orderID)
    return {"result":"success"}
@app.route("/delete_weight/<int:wid>")
@login_required
def delete_weight(wid):
    deleteWeight(wid)
    return {"result": "success"}

@app.route("/items")
@login_required
def item_list():
    return render_template("items.html", items = getItemList())

@app.route("/item/<int:id>/flip")
@login_required
def item_flip(id):
    itemFlip(id)
    return redirect(url_for("item_list"))