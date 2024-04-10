// get the query string into an easy-to-use object
const params = (new URL(document.location)).searchParams;
let errors = {};
let quantities = [];

// check if the query string has errors, if so parse it
if (params.has('errors')) {
  errors = JSON.parse(params.get('errors'));
  // get the quantities also to insert into the form to make it sticky
  quantities = JSON.parse(params.get('quantities'));
  // modify code here to put up an alert if you have an error in errors indicating no quantities were selected
  if (quantities.every(qty => parseInt(qty) == 0)) {
    alert('Please select at least 1 quantity for an item before submitting.');
    document.getElementById('PurchaseButton').value = 'Please select 1 item';
  } else {
    // Put up an alert box if there are errors
    alert('Please fix the errors in the form and resubmit');
  }
}

let products;

window.onload = async function () {
  // use fetch to retrieve product data from the server
  // once the products have been successfully loaded and formatted as a JSON object
  // display the products on the page
  await fetch('products.json').then(async function (response) {
    if (response.ok) {
      response.json().then(function (json) {
        products = json;
        display_products();
      });
    } else {
      console.log('Network request for products.json failed with response ' + response.status + ': ' + response.statusText);
    }
  });
}

// function to perform the filtering of the products
function myFunction() {
  var input, filter, ul, si, a, i, txtValue;
  input = document.getElementById("search_textbox");
  filter = input.value.toUpperCase();
  si = document.getElementsByTagName("section");
  for (i = 0; i < si.length; i++) {
    a = si[i].getElementsByTagName("h2")[0];
    txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      si[i].style.display = "";
    } else {
      si[i].style.display = "none";
    }
  }
}

function display_products() {
  // loop through the products array and display each product as a section element
  for (let i = 0; i < products.length; i++) {
    let quantity_label = 'Quantity';
    // if there is an error with this quantity, put it in the label to display it
    if ((typeof errors['quantity' + i]) != 'undefined') {
      quantity_label = `<font class="error_message">${errors['quantity' + i]}</font>`;
    }
    let quantity = 0;
    // put previous quantity in textbox if it exists
    if ((typeof quantities[i]) != 'undefined') {
      quantity = quantities[i];
    }
    products_main_display.innerHTML += `
    <div class="w3-quarter w3-center w3-padding">
    <img src="./images/${products[i].image}" style="width:100%; height: 300px;">
    <h2>${products[i].name}</h2>
    <h3>${products[i].quantity_available} available</h3>
    <h3>$${products[i].price}</h3>
    <label>${quantity_label}</label>
    <input type="text" placeholder="0" name="quantity_textbox[${i}]" value="${quantity}">
    </div> 
`;
  }
}