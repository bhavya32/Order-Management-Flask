var socket = io();

socket.on('connect', function() {
        socket.emit('my event', {data: 'I\'m connected!'});
});
socket.on('update', async function(data) {
    console.log(data, "time to refresh");
    await refreshTable();

    notifyResult(data["title"], data["message"]);
});

//window.addEventListener("keyup", function(e){ if(e.keyCode == 27) history.back(); }, false);

async function refreshTable() {
    let currTable = document.getElementById("orderList");
    //get current window url
    let url = window.location.pathname;
    let res = await fetch(url);
    let html = await res.text();
    var dummy = document.createElement('html');
    dummy.innerHTML = html;
    let newTable = dummy.getElementsByTagName("table")[0];
    currTable.innerHTML = newTable.innerHTML;

}

let crfi = -1
function changeRowFocus(idx) {
    if (idx <= 0) {idx = 1;}
    let table = document.getElementById("orderList");
    if (idx >= table.rows.length) {idx = table.rows.length - 1;}
    if (crfi != -1){table.rows[crfi].classList.remove("table-secondary");}
    table.rows[idx].classList.add("table-secondary");
    crfi = idx;
}
function gotoOrder() {
    let table = document.getElementById("orderList");
    if (crfi != -1) {
        table.rows[crfi].click();
    }
}

function notifyResult(title, message) {
    let toast = new bootstrap.Toast(document.getElementById("liveToast"));
    document.getElementById("toastBody").innerHTML = message;
    document.getElementById("toastTitle").innerHTML = title;
    toast.show();
}

function delete_order(id) {
    console.log("deleting ", id)
    let url = './complete/' + id;
    fetch(url).then(() => {
        refreshTable()
    })
    
    return false; 
}

window.addEventListener("keyup", function(e){ if(e.keyCode == 40) changeRowFocus(crfi + 1); }, false);
window.addEventListener("keyup", function(e){ if(e.keyCode == 38) changeRowFocus(crfi - 1); }, false);
window.addEventListener("keyup", function(e){ if(e.keyCode == 13) gotoOrder() }, false);