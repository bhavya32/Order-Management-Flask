function createOrder() {
    var partyName = document.getElementById("partyName").value;
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
        "partyName": partyName,
        "orderItems": orderItems
    };

    fetch('/create_order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Handle the response data here
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

function sizeChange(el) {
    var size = el.value;
    var mm = el.parentElement.parentElement.children[3]
    mm.innerHTML = parseImperial(size) + " mm";
    nextRow(el);
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

async function getItemList() {
    let url = './get_item_names';
    let json = await fetch(url)
    //console.log(await json.json())
    itemList = await json.json()
    json = await fetch('./get_party_names')
    partyList = await json.json()
    populateDatalistOptions();
}
itemList = []
partyList = []
getItemList();
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

var socket = io();
socket.on('connect', function() {
        socket.emit('my event', {data: 'I\'m connected!'});
});

window.addEventListener("keyup", function(e){ if(e.keyCode == 27) history.back(); }, false);