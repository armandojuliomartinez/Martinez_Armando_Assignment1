// loads the products array into server memory from the products.json file
const products = require(__dirname + '/products.json');// load the products.json file into memory

const express = require('express');
const app = express();

// This processes the form data in a POST request so that the form data appears in request.body
const myParser = require("body-parser"); //body parser is a middle ware from node
app.use(myParser.urlencoded({ extended: true }));

// Log requests to the console
app.all('*', function (request, response, next) {
  console.log(request.method + ' to ' + request.path);
  next();
});

// A micro-service to return the products data currently in memory on the server as
// javascript to define the products array
app.get('/products.json', function (req, res, next) {
  res.json(products);
});

// A micro-service to process the product quantities from the form data
// redirect to invoice if quantities are valid, otherwise redirect back to products_display
app.post('/process_purchase_form', function (req, res, next) {
  console.log(req.body)
  // only process if purchase form submitted
  const errors = {}; // assume no errors to start
  let quantities = [];
  if (typeof req.body['quantity_textbox'] != 'undefined') {
    quantities = req.body['quantity_textbox'];
    // Loop through the quantities submitted
    for (let i in quantities) {
      // validate the quantity is a non-negative integer. Add to errors object if not.
      if (!isNonNegInt(quantities[i])) {
        errors['quantity' + i] = isNonNegInt(quantities[i], true).join('<br>');
      } else {
        const productId = parseInt(i);
        const requestedQty = parseInt(quantities[i]);
        //validates the quantity requested is less than or equal to the quantity available and adds to errors object if not
        if (!isNaN(productId) && products[productId] && products[productId].quantity_available < requestedQty) {
          errors['quantity' + i] = 'Not enough available in inventory';
        }
      }
    }
    // Checks if the quantities array has at least one value greater than 0 (i.e. something was purchased) and adds to errors object if not.
    if (!quantities.some(qty => parseInt(qty) > 0)) {
      errors['quantity'] = 'Please select at least one item to purchase';
    }

    //This just logs the purchase data to the console and where it came from. It is not required.
    console.log(Date.now() + ': Purchase made from ip ' + req.ip + ' data: ' + JSON.stringify(req.body));
  }

  // create a query string with data from the form
  const params = new URLSearchParams();
  params.append('quantities', JSON.stringify(quantities));
  // If there are errors, send user back to fix otherwise redirect to invoice with the quantities in the query string

  // If there are errors, send user back to fix otherwise send to invoice
  if (Object.keys(errors).length > 0) {
    // Have errors, redirect back to store where errors came from to fix and try again
    params.append('errors', JSON.stringify(errors));
    res.redirect('store.html?' + params.toString());
  } else {
    updateInventory(quantities)
    //redirects to invoice
    res.redirect('./invoice.html?' + params.toString());
  }

});

app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`));

//this funtion updates the inventory
function updateInventory(quantities) {
  for (let i in quantities) {
    const qty = parseInt(quantities[i]);
    if (!isNaN(qty) && qty > 0) {
      const productId = parseInt(i);
      if (!isNaN(productId) && products[productId] && products[productId].quantity_available >= qty) {
        products[productId].quantity_available -= qty;
      }
    }
  }
}

function isNonNegInt(q, returnErrors = false) {
  errors = []; // assume no errors at first
  if (q == '') q = 0; // handle blank inputs as if they are 0
  if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
  else {
    if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
    if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
  }
  return returnErrors ? errors : (errors.length == 0);
}
