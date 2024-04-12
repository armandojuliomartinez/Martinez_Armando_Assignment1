// get the query string into a easy to use object
const params = (new URL(document.location)).searchParams;

let quantities = [];
// check if the query string has quantities, parse it and convert elements to numbers
if (params.has('quantities')) {
  quantities = JSON.parse(params.get('quantities')).map(Number);
} else {
  console.log('No quantities in query string');
}

let products;
window.onload = function () {
  // use fetch to retrieve product data from the server
  // once the products have been successfully loaded and formatted as a JSON object
  // display the invoice
  fetch('products.json').then(function (response) {
    if (response.ok) {
      response.json().then(function (json) {
        products = json;
        display_invoice();
      });
    } else {
      console.log('Network request for products.json failed with response ' + response.status + ': ' + response.statusText);
    }
  });
}

function display_invoice() {
  let extended_price;
  let subtotal = 0;
  const table = document.getElementById('invoice_table');

  for (let i in quantities) {
    if (quantities[i] == 0) continue; // don't output zero quantity items
    extended_price = quantities[i] * products[i].price;
    subtotal += extended_price;
    
    let new_row = table.insertRow(1); // Inserts after the first row (index 1)

    // Assuming products[i].image contains the image path
    new_row.innerHTML = `
      <td width="43%">
        <img src="./images/${products[i].image}" style="width: 50px; height: 50px; float: left; margin-right: 10px;">
        ${products[i].name}<div class="popup">${products[i].description}</div></div></td>
      </td>
      <td align="center" width="11%">${quantities[i]}</td>
      <td width="13%">\$${products[i].price}</td>
      <td width="54%">\$${extended_price.toFixed(2)}</td>
    `;
  }

  // Compute subtotal and write into table
  document.getElementById('subtotal_span').innerText = subtotal.toFixed(2);

// Compute tax and write into table
  let tax_rate = 0.0575;
  document.getElementById('tax_rate_span').innerText = (100 * tax_rate).toFixed(2);
  let tax = tax_rate * subtotal;
  document.getElementById('tax_span').innerText = tax.toFixed(2);

// Compute shipping and write into table
  let shipping;
  if (subtotal <= 50) {
    shipping = 2;
  } else if (subtotal <= 100) {
    shipping = 5;
  } else {
    shipping = 0.05 * subtotal; // 5% of subtotal
  }
  document.getElementById('shipping_span').innerText = shipping.toFixed(2);

// Compute grand total and write into table
  let total = subtotal + tax + shipping;
  document.getElementById('total_span').innerText = total.toFixed(2);
}

// IR4 If the purchase is invalid (see three conditions given in the instructions above), change the purchase button text from “Purchase” to text that indicates why the purchase is invalid e.g. “Please Select Some Items to Purchase”. Do not disable the button or add a guard that prevents the user form purchasing.