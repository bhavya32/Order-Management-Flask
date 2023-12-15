from .models import PartyList, db, User, Order, OrderItem, ItemList


def getActiveOrders() -> Order:
    return Order.query.filter_by(status=0).all()

def getOrderItems(orderID) -> OrderItem:
    return OrderItem.query.filter_by(orderID=orderID).all()

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

def weightUpdate(itemID, weight):
    item = OrderItem.query.filter_by(itemID=itemID).first()
    if item.weight != None:
        item.weightOld = weight
    item.weight = weight
    db.session.commit()
    return item.orderID, item.itemName