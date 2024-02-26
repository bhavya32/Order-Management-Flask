from .models import PartyList, WeightList, db, User, Order, OrderItem, ItemList


def getActiveOrders() -> Order:
    return Order.query.filter_by(status=0).all()

def getOrderItems(orderID) -> OrderItem:
    return OrderItem.query.filter_by(orderID=orderID).all()

def splitOrderItems(orderItems):
    items = [[], []]
    for item in orderItems:
        itemx = ItemList.query.filter_by(itemName=item.itemName).first()
        if itemx == None:
            items[1].append(item)
        elif itemx.itemLoc == 1:
            items[0].append(item)
        else:
            items[1].append(item)
    return items
    

def getItemWeight(itemID):
    return WeightList.query.filter_by(itemID=itemID).all()

def deleteWeight(wid):
    w = WeightList.query.filter_by(wid=wid).first()
    db.session.delete(w)
    db.session.commit()

def createNewOrder(order, orderItems):
    o = Order()
    o.partyName = order
    o.creator = 1
    o.status = 0
    db.session.add(o)
    db.session.commit()
    for orderItem in orderItems:
        oi = OrderItem()
        oi.itemName = orderItem["name"]
        oi.orderID = o.orderID
        oi.itemDesc = orderItem["desc"]
        oi.itemQty = orderItem["qty"]
        oi.itemUnit = orderItem["unit"]
        db.session.add(oi)
    db.session.commit()
    return o.orderID

def getOrderByID(orderID):
    return Order.query.filter_by(orderID=orderID).first()

def getItemList():
    return ItemList.query.all()

def getPartyList():
    return PartyList.query.all()

def getUser(username):
    return User.query.filter_by(username=username).first()
def getCreatorName(creator):
    return User.query.filter_by(userID=creator).first().username
def changeOrderStatus(id):
    odr = Order.query.filter_by(orderID=id).first()
    odr.status=1
    db.session.commit()
    return 1
def weightUpdate(itemID, weight):
    item = OrderItem.query.filter_by(itemID=itemID).first()
    w = WeightList()
    if itemID != None:
        w.itemID = itemID
    w.weight = weight
    db.session.add(w)
    db.session.commit()
    return item.orderID, item.itemName