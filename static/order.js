async function getOrderItems() {
    let url = './get_item_names';
    let json = await fetch(url)
    //console.log(await json.json())
    itemList = await json.json()
    json = await fetch('./get_party_names')
    partyList = await json.json()
    populateDatalistOptions();
}

var socket = io();
socket.on('connect', function() {
    socket.emit('my event', {data: 'I\'m connected!'});
});

window.addEventListener("keyup", function(e){ if(e.keyCode == 27) history.back(); }, false);


async function getOrderItems() {
    let url = '/get_order_items/' + window.location.pathname.split("/").pop();
    let json = await fetch(url);
    let itemList = await json.json();
    return itemList;
}

function parseWeight(w1, w2) {
    if (!w1 && !w2){
        return "-";
    }
    if (!w2) {w2 = 0;}
    return (w1 + w2)/100 + " Kg";
}

async function populateOrderTable() {
    let itemList = await getOrderItems();
    let il = itemList["orderItems"];
    let table = document.getElementById("orderItemsList");
    let t = table.rows.length
    for (var i = 1; i < t; i++) {
        table.deleteRow(1);
    }
    for(let i=0; i<il.length; i++) {
        let row = table.insertRow();
        let t = [i+1, il[i]["itemName"], il[i]["itemQty"],il[i]["itemUnit"], il[i]["itemDesc"], parseWeight(il[i]["weight"], il[i]["weightOld"])];
        
        for (let j=0; j<t.length; j++) {
            let cell = row.insertCell();
            cell.innerHTML = t[j];
        }
    }
}

window.onload = function() {
    populateOrderTable();
}

async function print() {
    let url = '/print_order/' + window.location.pathname.split("/").pop();
    let json = await fetch(url);
    let res = await json.json();
    
    notifyResult(res["result"]);
}

function notifyResult(message) {
    let toast = new bootstrap.Toast(document.getElementById("liveToast"));
    document.getElementById("toastBody").innerHTML = message;
    toast.show();
}

window.addEventListener("keydown", function(e) {
    if (e.ctrlKey && e.key === "p") {
        print();
        e.preventDefault();
    }
});
  