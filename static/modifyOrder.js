
function get_weight(el) {
    if (typeof(el) == "string") {
        if (el == "-") {return 0;}
        let w = el.split(" ")[0];
        return w
    }
}

async function getItems() {
    let url = '/get_item_names';
    let json = await fetch(url)
    //console.log(await json.json())
    itemList = await json.json()
    json = await fetch('/get_party_names')
    partyList = await json.json()
    populateDatalistOptions();
}

window.addEventListener("keyup", function(e){ if(e.keyCode == 27) {
    history.back();
} }, false);


async function getOrderItems() {
    let url = '/get_order_items/' + window.location.pathname.split("/").pop();
    let json = await fetch(url);
    let itemList = await json.json();
    return itemList;
}


function parseWeight(wl) {
    
    if( wl.length == 1 ){
        return wl[0]["weight"]/100 + " Kg";
    }
    else{
        return "-";
    }
}

async function delete_item(button, item_id){
    console.log("deleting", item_id)
    button.disabled = true
    button.innerHTML= "Deleting"
    let json = await fetch("/delete_order_item/" + item_id);
    let result = await json.json();
    if(result["result"] == "success") {
        button.innerHTML= "Deleted"    
    }
    else {
        button.innerHTML= "Failed to delete"
        button.disabled = false
    }
    
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
        let t = [i+1, il[i]["itemName"], il[i]["itemQty"],il[i]["itemUnit"], il[i]["itemDesc"], parseWeight(il[i]["weightList"]), '<button onclick="event.stopPropagation();delete_item(this,' + il[i]["itemID"] + ')" class="btn btn-outline-danger btn-sm">Delete</button>'];
        
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
}



itemList = []
partyList = []
getItems();
function populateDatalistOptions() {
    var datalist = document.getElementById('itemList');
    itemList.forEach(element => {
        var option = document.createElement('option');
        option.value = element;
        datalist.appendChild(option);
    });
    datalist = document.getElementById('partyList');
    partyList.forEach(element => {
        var option = document.createElement('option');
        option.value = element;
        datalist.appendChild(option);
    });
}




function modify() {
    var orderItems = [];

    var table = document.getElementById("orderTable");
    var rows = table.rows;
    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var cells = row.cells;
        var item = {};
        item.name = cells[1].children[0].value;
        item.qty = cells[2].children[0].value;
        item.unit = cells[3].children[0].value;
        item.desc = cells[4].children[0].value;
        if (item.name != "" && item.quantity != "" && item.unit != "") {
            orderItems.push(item);
        }
    }
    var order = {
        "orderID": window.location.pathname.split("/").pop(),
        "orderItems": orderItems
    };

    fetch('/modify_order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        window.location.href = "/order/" + data.orderID;
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle any errors here
    });
}

function nextRow(el) {
    var table = el.parentElement.parentElement.parentElement;
    if (table.rows[table.rows.length - 1] == el.parentElement.parentElement) {
    var row = table.insertRow(table.rows.length);
    var cell0 = row.insertCell(0);
    var cell1 = row.insertCell(1);
    var cell2 = row.insertCell(2);
    var cell3 = row.insertCell(3);
    var cell4 = row.insertCell(4);
    cell0.innerHTML = (table.rows.length - 1).toString();
    cell1.innerHTML=`<input type="text" list="itemList" onkeyup="enterLcell(event)">`;
    cell2.innerHTML = `<input type="text" placeholder="0" oninput="nextRow(this)" onkeyup="enterLcell(event)">`;
    cell3.innerHTML=`<input type="text" list ="unitList" onkeyup="enterL(event)">`;
    cell4.innerHTML=`<input type="text" placeholder="Desc." onkeyup="enterL(event)">`;
    return cell1
    }
    else {
        console.log(table[table.rows.length - 1])
    }
}


function enterL(e) {
    if (e.key == "Enter") {
        e.target.parentElement.parentElement.nextElementSibling.children[1].children[0].focus();

    }
}

function enterLcell(e) {
    if (e.key == "Enter") {
        e.target.parentElement.nextElementSibling.children[0].focus();

    }

}