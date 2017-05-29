/**
 *  @fileOverview Creates a server that listens on port 3001.
 *  @author Alan O'Riordan
 */


var http = require('http');
var mysql = require('mysql');
var fs = require('fs');
var path = require('path');
var hogan = require('hogan.js');
var qs = require('querystring');
var formidable = require('formidable');
var util = require('util');

//Setting up a db connection
var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password: 'Xiqucac7',
    database: 'productdb'
});

//Attempt to connect
connection.connect(function(err){
    if(!err){
        console.log("Database is connected");
    }else{
        console.log("An error occurred while trying to connect to the database");
        console.log(err);
    }
});

var server = http.createServer(function(req, res) {
     switch (req.method) {
         case 'POST':
             console.log("Post request");
             console.log("URL: " + req.url);
             switch (req.url) {
                 case '/':
                     break;

                 case '/deleteProduct':
                         var body = '';
                         //var obj = '';
                         req.on('data', function (data) {
                             body += data;
                         });
                         req.on('end', function () {
                             obj = qs.parse(body);
                             deleteProduct(obj, req, res);
                         });
                     break;

                 case '/updateProduct':
                     console.log("URL: updateProduct")
                     var body = '';
                     //var obj = '';
                     req.on('data', function (data) {
                         body += data;
                     });
                     req.on('end', function () {
                         obj = qs.parse(body);
                         updateProduct(obj, req, res);
                     });

                     break;

                 case '/addProduct':
                     processFormFieldsIndividual(req, res);
                     break;

                 case '/placeOrder':
                     var body = '';
                     req.on('data', function (data) {
                         body += data;
                     });
                     req.on('end', function () {
                         obj = qs.parse(body);
                         checkStock(obj, req, res);
                         //displayCatalog(req, res);
                     });
                     break;
             }

             break;


             case 'GET':

             console.log("Get Request");
             console.log("URL: " + req.url);

             if (req.url.slice(-3) == "jpg") {
                 console.log("Image request");
                 imageRequest(req, res);
                 }
             else {
                 switch (req.url) {
                     case '/':
                         console.log("url: /")
                         displayCatalog(req, res);
                         break;

                     case '/public/stylesheets/style.css':
                         //work.showArchived(db, res);
                         css(req, res);
                         break;

                     case '/shoppingCart.js':
                         //work.showArchived(db, res);
                         js(req, res);
                         break;

                     case '/Admin':
                         console.log("url: /Admin")
                         displayAdmin(req, res);
                         break;

                     case '/Orders':
                         displayOrders(req, res);
                         break;

                     default :
                         send404(res);

                 }
             }

     }});

console.log("Sever running on localhost:3001");
server.listen(3001);

/**
 * Generates HTML page to be displayed. Takes in a header and footer html file.
 * @param {object} req request object
 * @param {object} res response object
 * @param {string} str the information to added to the html file
 * @param [string] footer html information to br added to the end of the file
 */
function showPage(req, res, str, footer) {
    res.writeHead(
        200,
        {"content-type": 'text/html'}
    );
    console.log("showpage");
    var data = fs.readFileSync("./header.html", 'utf8');

    data += str;

    data += fs.readFileSync("./footer.html", 'utf8');

    res.end(data);
}

/**
 * Used to serve css files
 *
 * @param {object} request
 * @param {object} response
 */
function css(request, response) {
    if (request.url == '/public/stylesheets/style.css') {
        response.writeHead(200, {'Content-type' : 'text/css'});
        var fileContents = fs.readFileSync('./public/stylesheets/style.css', {encoding: 'utf8'});
        response.end(fileContents);
    }
}
/**
 * Serves javascript files
 *
 * @param {object} request
 * @param {object} response
 */
function js(request, response) {
    if (request.url == '/shoppingCart.js') {
        console.log("Javascript request")
        response.writeHead(200, {'Content-type' : 'application/javascript'});
        var fileContents = fs.readFileSync('./public/javascripts/shoppingCart.js', {encoding: 'utf8'});
        response.end(fileContents);
    }
}

/**
 * Used to handle requests for image files
 * @param {object} request
 * @param {object} response
 */

function imageRequest(request, response) {
    //if (request.url.slice(-3) == 'jpg') {
        console.log("Image.url: ." + request.url);
        var image = fs.createReadStream('.' + request.url);
        image.on('open', function () {
            response.setHeader('Content-Type', 'image/jpg');
            image.pipe(response);
        });
    //}
}

/**
 * Generates HTML to display the shop catalog and forms for making orders
 * @param {object} req
 * @param {object} res
 */
function displayCatalog(req, res) {
    console.log("First query");

    //var template = fs.readFileSync("./footer.html", 'utf8');

    var data = "";
    //var context = {products: ''};
    connection.query(
        "SELECT * FROM product",
        function(err, rows, fields){
            data += '<table id = "catalog" >';
            data += '<th>Item</th><th> Product Name </th><th> Description </th><th>Price</th><th>Options</th>';
            for(var i = 0; i < rows.length; i++){
                data += '<tr>';
                data += '<td><img src="'+rows[i].Image+'" width="100" height="100"></td>';
                data += '<td>' + rows[i].Name + '</td><td>' + rows[i].Description + '</td><td>' + rows[i].Price + '</td><td><button class="add-to-cart" data-name="'+rows[i].Name+'" data-price="'+rows[i].Price+'" data-id="'+rows[i].ID+'" onclick="">Add to Cart</button></td>';
                data += '</tr>';
            }
            data += '</table>';

            data += '<fieldset>'
            data += '<form action ="/placeOrder" method="POST">';
            data += '<div>'+
                '<ul id="show-cart">'+
                '<li>???????</li>'+
                '</ul>'+
                '<div>You have <span id="count-cart">X</span> items in your cart</div>'+
                '<div>Total Cart:$<span id="total-cart"></span></div>'+
                '<button type="button" id="clear-cart">Clear Cart</button>'+
                '<input id="show-cart" type="submit" value="Order Now">'+
                '</div>';
            data += '</form>';
            data += '</fieldset>';

            showPage(req, res, data, "./footer.html");
        }
    );
}

/**
 * Used to generates the admin page which allows for adding and removing of items.
 *
 * @param {object} req
 * @param {object} res
 */
function displayAdmin(req, res) {
    console.log("Display Admin");
    var data = "";
    connection.query(
        "SELECT * FROM product",
        function(err, rows, fields){
            data += '<table id = "catalog" >';
            data += '<th>Item</th><th> Product Name </th><th> Description </th><th>Price</th><th>Stock</th><th>Operation</th>';
            for(var i = 0; i < rows.length; i++){

                data += '<tr><form action ="/updateProduct" method="POST">';
                data += '<td><img src="'+rows[i].Image+'" width="100" height="100"></td>';
                data += '<td><input type = "hidden" name="ID" value="'+rows[i].ID+'"><input type ="text" name="Name" value="'+rows[i].Name+'"</td>';
                data += '<td><input type ="textarea" rows="4" cols="40" name="Description" value="'+rows[i].Description+'"></textarea></td>';
                data += '<td><input type ="text" name="Price" value="'+rows[i].Price+'"</td>';
                data += '<td><input type ="text" name="Stock" value="'+rows[i].stock+'"</td>';
                data += '<td><input type="submit" value="Update">';
                data += '</form>'
                data +='<button onclick="deleteProduct('+rows[i].ID+')">Delete</button>'+ '</td>';
                data +='</tr>';
            }

            data += '</table>';

            //Creates form for adding new products to the system.

            data +=
                '<div class="form-mini-container">'+
                '<form class="form-mini" action="/addProduct" method="post" enctype="multipart/form-data">'+
                       '<fieldset>'+
                          '<br />'+
                          '<div class="form-row">'+
                          //'<label for="Image">Image:</label>'+
                          '<input type="file" id="Name" name="image" />'+
                          '</div>'+
                          '<br />'+

                          '<div class="form-row">'+
                          '<input type="text" id="Name" name="Name" placeholder="Product Name" />'+
                          '</div>'+
                          '<br />'+

                          '<div class="form-row">'+
                          '<input type="text" id="stock" name="stock" placeholder="Stock Level" />'+
                          '</div>'+
                          '<br />'+

                          '<div class="form-row">'+
                          '<input type="number" id="price" name="Price" placeholder="Price" />'+
                          '</div>'+
                          '<br />'+

                          '<div class="form-row">'+
                          '<textarea id="description" name="Description" placeholder="Product Description"></textarea>'+
                          '</div>'+
                          '<br />'+

                          '<div class="form-row form-last-row">'+
                          '<button id="form-mini button" type="submit">Add Product</button>'+
                          '</div>'+
                       '</fieldset>'+
                     '</form>'+
                     '</div>';

            showPage(req, res, data, "./footer.html");

        }
    );
}


/**
 * Used to delete a stock item from the database
 *
 * @param {object} obj Parsed request object
 * @param {object} req
 * @param {object} res
 */
function deleteProduct(obj, req, res) {
    console.log(obj.ID);
    connection.query(
        'DELETE FROM product WHERE ID=?', [obj.ID], function(err){
            if (err) {
                throw err;
            }
        });
    displayAdmin(req, res);
}

/**
 * Used to update a stcok items details in the database
 *
 * @param {object} obj parsed request object
 * @param req
 * @param res
 */
function updateProduct(obj, req, res) {
    console.log(obj);
    //console.log(Object.prototype.hasOwnProperty.values(obj));
    connection.query(
        'UPDATE product SET Name = ?, Description = ?, Price = ?, stock = ? WHERE ID = ?',
        [obj.Name, obj.Description, obj.Price, obj.Stock, obj.ID],
        function(err){
            if (err) {
              throw err;
            }
        });
    displayAdmin(req, res);
}


/**
 * Used to add products to the product table
 * @param {object} obj Parsed request object
 * @param {object} req
 * @param {object} res
 */
function addProduct(obj, req, res) {
    console.log("obj name: " + util.inspect(obj));
    //console.log(Object.prototype.hasOwnProperty.values(obj));
    var input = [obj.Image, obj.Name, obj.Description, obj.stock, obj.Price];
    console.log(input);
    //console.log([obj.name, obj.Description, obj.stock, obj.Price]);
    connection.query(
        'INSERT INTO product (Image, Name, Description, stock, Price) VALUES (?, ?, ?, ?, ?)',
        //[input],
        [obj.Image, obj.Name, obj.Description, obj.stock, obj.Price],
        function(err){
            if (err) {
                throw err;
            }
            displayAdmin(req, res);
        });
}

/**
 * Used to place orders and store order details in the database.
 * Item Product ID and quantity are used to calculate the order.
 * @param {object} obj Parsed request object
 * @param {object} req
 * @param {object} res
 */
function placeOrder(obj, req, res){
    console.log("obj quantity: " +obj.quantity);
    console.log("obj id: " + obj.id);
    var order = [];
    var prices = [];
    var total = 0;
            connection.query(
            "SELECT Price FROM product WHERE ID IN (?)",
            //[obj.id[0],obj.id[1]],
            [obj.id],
            function (err, rows, fields) {
                if (err) throw err;
                console.log("Result: ");
                console.log(rows);
                order = rows;
            })
                .on('end', function(){
                //console.log("Price: " + order[0].Price);
                for (var i =0; i < order.length; i++){
                    prices.push(order[i].Price);
                    obj.quantity[i] = parseInt(obj.quantity[i]);
                }
                console.log("Prices: "+prices)
                for (var i=0; i < prices.length; i++){
                    //console.log(obj.quantity[i] + " " + prices[i]);
                    //console.log(typeof(obj.quantity[i]) + " " + typeof(prices[i]));
                    //total += prices[i]*(parseInt(obj.quantity[i]));
                    total += (prices[i])*(obj.quantity[i]);
                }
                console.log("total: "+total);
                console.log("Fix this");
                connection.query(
                    'INSERT INTO productdb.order (customer_id, Cost) VALUES (?, ?)',
                    [1, total],
                    function(err){
                        if (err) {
                        throw err;
                        }
                        //displayCatalog(req, res);
                    })
                    .on('end', function(){
                        console.log("obj is " + obj.quantity[0]);
                        orderItems(obj);
                    });

                });
            displayCatalog(req,res);
}



/**
 * Handles the form for adding new products to the database
 * Form consists of fields and an image file
 * Note only .jpg files should be used.
 * @param {object} req
 * @param {object} res
 */

function processFormFieldsIndividual(req, res) {
    //Store the data from the fields in your data store.
    //The data store could be a file or database or any other store based
    //on your application.
    var image_folder = "C:/Users/oriora6/Desktop/SSD_SOFT7008/Attempt2/public/images/";
    var obj = {};
    var fields = [];
    var upload = {};
    var form = new formidable.IncomingForm();
    //form.multiples = true;
    //form.uploadDir = "./public/images";
    //Call back when each field in the form is parsed.
    form.on('field', function (field, value) {
        console.log(field);
        console.log(value);
        fields[field] = value;
        obj[field] = value;
    });
    //Call back when each file in the form is parsed.
    form.on('file', function (name, file) {
        var temp_path = this.openedFiles[0].path;
        var temp_name = this.openedFiles[0].name;
        console.log("temp Path: " + temp_path );
        console.log(name);
        console.log("temp name: " + temp_name);
        fs.rename(temp_path, image_folder + temp_name, function(err) {
            if (err){
                throw err;
            }
        });
        obj['Image'] = './public/images/' + temp_name;
        console.log(file);
        fields[name] = file;
        //Storing the files meta in fields array.
        //Depending on the application you can process it accordingly.
    });

    //Call back at the end of the form.
    form.on('end', function (fields, files) {
        addProduct(obj, req, res);
        var upload_path = this.openedFiles[0].path;
        console.log("File Path: " + upload_path);
        /*fs.unlink(upload_path, function(err) {
            if (err) throw err;
        });*/
    });
    form.parse(req);
}

/**
 * Used to add items and quantities to orderitem table.
 * This allows for all the details of an order to be stored across the order and orderitem table.
 * @param {object} obj Parsed request object
 * @param {object} req
 * @param {object} res
 */
function orderItems(obj, req, res) {

    var order = [];
    console.log("Object details: " +obj.id);

        connection.query(
            "select ID from productdb.order order by id desc limit 1",
            function (err, rows, fields) {
                if (err) throw err;
                console.log("Result: ");
                console.log(rows[0].ID);
                order = rows;
                // Convert the id variable into an Array if there is only one id
                if (!(order.id instanceof Array)) {
                    order.id = [order.id];
                }
            })
            .on('end', function () {
                console.log("Orders: " + order[0].ID);
                //console.log("ID's: " + obj.id[i]);
                //console.log(i);
                for (var i = 0; i < obj.quantity.length; i++) {
                    console.log(i);
                    console.log("Fix this 2");
                    console.log("ID: " + obj.id);
                    connection.query(
                        'INSERT INTO productdb.orderitem (Order_ID, Product_ID, Quantity) VALUES (?, ?, ?)',
                        [order[0].ID, obj.id[i], obj.quantity[i]],
                        function (err) {
                            if (err) {
                                throw err;
                            }
                        });
                }
                //displayCatalog(req, res);

            });
            //displayCatalog(req, res);
}

/**Used to check if theres is sufficient stock of a product before an order is placed.
 * If there is insufficient stock a notice page will be displayed.
 * @param {object} obj Parsed request object
 * @param {object} req
 * @param {object} res
 */
function checkStock(obj, req, res){
    var nums;
    console.log("IDs to check: " + obj.id);
    //Checks if there is an array of values or just a single value
    if (!(obj.id instanceof Array)){
        nums = parseInt(obj.id);
    }else{
        nums = obj.id.map(Number);
    }
    var stock = [];
    data = "";
    var stockError = false;
    console.log(nums);
    connection.query(
        "select Name ,stock from productdb.product where ID IN (" +mysql.escape(nums)+")" ,
        //[obj.id[0],obj.id[1]],
        function (err, rows, fields) {
            if (err) throw err;
            console.log("Result: ");
            console.log(rows);
            stock = rows;
        })
        .on('end', function () {
            for (var i = 0; i < stock.length; i++) {
                if (obj.quantity[i] > stock[i].stock) {
                    console.log("STOCK ERROR: " + stock[i].Name);
                    data += '<p>Insufficient stock of ' + stock[i].Name + ' </p>';
                    showPage(req, res, data);
                    stockError = true;
                    //break;
                }
            }
            if (stockError == false) {
                placeOrder(obj, req, res);
            }
        });


}

/**
 * Used to display a 404 response if a page is not found.
 * @param {object} response
 */
function send404(response) {
    console.log("404");
    response.writeHead(404, {'Content-Type': 'text/html'});
    data = fs.readFileSync("./header.html", 'utf8');
    //response.write('Error 404: resource not found.');

    data += '</br>';
    data += '<p>Error 404: resource not found.</p>';
    data += '</br>';

    data += fs.readFileSync("./footer.html", 'utf8');
    response.end(data);
}

/**
 * Used to display orders
 *
 * @param {object} req
 * @param {object} res
 */
function displayOrders(req, res) {
    console.log("Orders query");

    var data = "";
    //var context = {products: ''};
    connection.query(
        "SELECT * FROM productdb.order",
        function(err, rows, fields){
            data += '<table id = "catalog" >';
            data += '<th>Customer ID</th><th> Price </th>';
            for(var i = 0; i < rows.length; i++){
                data += '<tr>';
                data += '<td>' +rows[i].customer_id+ '</td>';
                data += '<td>'+rows[i].Cost+'</td>';
                data += '</tr>';
            }
            data += '</table>';

            showPage(req, res, data, "./footer.html");
        }
    );
}