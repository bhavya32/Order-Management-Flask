let popupModal = false;


let modal = document.getElementById("weightDetailsModal");


window.onclick = function(event) {
    if (event.target == document.getElementById("weightDetailsModal")) {
        hideModal();
    }
}


function get_weight(el) {
    if (typeof(el) == "string") {
        if (el == "-") {return 0;}
        let w = el.split(" ")[0];
        return w
    }
}

async function copyTable() {
    let r = document.getElementById("orderItemsList").rows;
    let t = [];
    for (let i=1; i<r.length; i++) {
        let x = r[i].cells;
        let y = x[1].innerHTML;
        y += "\t" + get_weight(x[6].innerHTML) + "\tKgs.\t"+ x[4].innerHTML+"";
        t.push(y);
    }
    navigator.clipboard.writeText(t.join("\n")).then(function() {
        console.log("copied")
    });
}

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

window.addEventListener("keyup", function(e){ if(e.keyCode == 27) {
    if (popupModal) {hideModal(); return;}
    history.back();
} }, false);


async function getOrderItems() {
    let url = '/get_order_items/' + window.location.pathname.split("/").pop();
    let json = await fetch(url);
    let itemList = await json.json();
    return itemList;
}

function hideModal() {
    let modal = document.getElementById("weightDetailsModal");
    modal.style.display = "none";
    popupModal = false;
}

function showWeightDetails(wl) {
    let modal = document.getElementById("weightDetailsModal");
    
    let table = document.getElementById("weightDetailsTable");
    let t = table.rows.length
    for (var i = 1; i < t; i++) {
        table.deleteRow(1);
    }

    for(let i=0; i<wl.length; i++) {
        let row = table.insertRow();
        let t = [i+1, wl[i]["weight"]/100 + " Kg", wl[i]["timestamp"]];
        
        for (let j=0; j<t.length; j++) {
            let cell = row.insertCell();
            cell.innerHTML = t[j];
        }

        let del = row.insertCell();
        del.innerHTML = "<button onclick='delw(" + wl[i]["wid"] +")'>Delete</button>"
    }
    let span = document.getElementById("weightDetailsModalLabel");
    span.innerHTML = "Weight Details";
    modal.style.display = "block";
    popupModal = true;
}

function parseWeight(wl) {
    if (wl.length == 0){
        return "-";
    }
    if( wl.length == 1 ){
        return wl[0]["weight"]/100 + " Kg";
    }
    let total = 0;
    let xdiv = document.createElement("div");
    xdiv.className = "weightHolder";
    let tthtml = document.createElement("span");
    tthtml.className = "weightDetails";
    let rows = []
    for (let i=0; i<wl.length; i++) {
        total += wl[i]["weight"];
        rows.push(wl[i]["weight"]/100 + " Kg (" + wl[i]["timestamp"] + ")");
    }
    tthtml.innerHTML = rows.join("<br>");
    xdiv.innerHTML = "<button onclick() > <u>" + total/100 + " Kg</u>";
    xdiv.appendChild(tthtml);
    let lk = document.createElement("a");
    lk.href = "#";
    lk.innerHTML = " <u>" + total/100 + " Kg</u>";
    lk.onclick = function() {
        showWeightDetails(wl);
        return false;
    }
    //lk.onclick = "console.log('test')"
    return lk;
}

async function delw(wid) {
    let url = '/delete_weight/' + wid;
    await fetch(url);
    hideModal();
    populateOrderTable();
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
        let t = [i+1, il[i]["itemName"], il[i]["itemQty"],il[i]["itemUnit"],il[i]["rate"]/100 ,il[i]["itemDesc"], parseWeight(il[i]["weightList"])];
        
        for (let j=0; j<t.length; j++) {
            let cell = row.insertCell();
            if (typeof(t[j]) != 'object'){
                cell.innerHTML = t[j];
            } else {
                cell.appendChild(t[j]);
            }
        }
    }
}

window.onload = function() {
    populateOrderTable();
    modal = document.getElementById("weightDetailsModal");
    console.log(document.getElementById("weightDetailsModal"));
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
  