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