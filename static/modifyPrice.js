


async function getOrderItems() {
    let url = '/get_order_items/' + window.location.pathname.split("/").pop();
    let json = await fetch(url);
    let itemList = await json.json();
    return itemList;
}


function inputRate(rate) {
    return "<input style='width:70px; border:1.5px solid; border-radius:20px; text-align:center' type='number' value='"+rate +"' onkeyup='enterL(event)'>"
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
        let t = [i+1, il[i]["itemName"], il[i]["itemQty"],il[i]["itemUnit"],inputRate(il[i]["rate"]/100) ,il[i]["itemDesc"]];
        
        for (let j=0; j<t.length; j++) {
            let cell = row.insertCell();
            if (typeof(t[j]) != 'object'){
                cell.innerHTML = t[j];
            } else {
                cell.appendChild(t[j]);
            }
        }
        let cell = row.insertCell();
        cell.innerHTML = il[i]["itemID"]
        cell.style = "visibility:hidden"
    }
    document.getElementById("orderItemsList").children[0].children[1].children[4].children[0].select()
}

window.onload = function() {
    populateOrderTable();
}
function enterL(e) {
    if (e.key == "Enter") {
        nrow = e.target.parentElement.parentElement.nextElementSibling
        if(nrow) {
            nrow.children[4].children[0].select()
        }else{
            modify()
        }
    }
}

function parseRow(row) {
    return [row.children[6].innerHTML, Math.round(row.children[4].children[0].value*100) ]
}

function modify() {
    rows = document.getElementById("orderItemsList").children[0].children
    dict = {}
    for (var i = 1; i < rows.length; i++){
        //console.log(rows[i])
        var [id, price] = parseRow(rows[i])
        dict[id] = price
    }
    console.log(dict)
    fetch('/modify_price', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dict)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        window.location.href = "/order/" + window.location.pathname.split("/").pop();
    })
    
}