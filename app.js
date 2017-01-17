var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var morgan = require('morgan');
var path = require('path');
var fs = require("fs");
var cors = require('cors');
var methodOverride = require('method-override');
var https = require('https');

app.use(cors());
app.options('*', cors());

// local json files
var loginJson = require('./json/login.json');
var locationJson = require('./json/location.json');
var catalogJson = require('./json/catalog.json');
var productArticleJson = require('./json/productArticle.json');
var addtoCartJson = require('./json/addtoCart.json');
var checkoutJson = require('./json/checkout.json');
var taxCalculationJson = require('./json/taxCalculation.json');
var loyaltyCustomerJson = require('./json/loyaltyCustomer.json');
var customerLoyaltyPointsJson = require('./json/customerLoyaltyPoints.json');
var getCartJson = require('./json/getCart.json');

var routes = require('./routes/imagefile');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/')); 
app.use(function(req, res, next) {
     res.header("Access-Control-Allow-Origin", "*");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	 res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	 res.setHeader('Access-Control-Allow-Credentials', true);
     next();
 });


app.use(bodyParser.json({limit: '16mb'}));
app.use(bodyParser.urlencoded({extended: false }));

app.use(methodOverride(function (req, res) {
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method
    delete req.body._method
    return method;
  }
}));

// create a write stream (in append mode)
var accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'})

// setup the logger
app.use(morgan('combined', {stream: accessLogStream}))

//mongoose.connect('mongodb://localhost/LicensePlate');
 
app.use('/', routes);
app.set('view engine', 'ejs')
 

app.get('/images', function(req, res) {
	routes.getImages(function(err, genres) {
		if (err) {
		throw err;
		 
		}
		console.log("genres", genres);
		res.json(genres);
	 
	});
});
 
app.get('/images/:id', function(req, res) {
	routes.getImageById(req.params.id, function(err, genres) {
		if (err) {
		throw err;
		}
		//res.download(genres.path);
		res.send(genres.path);
	});
});

// login get API
app.get('/portal/user', function(req, res) {
   res.send(loginJson);
});

// location get API
app.get('/orion-organization/facilities',function(req, res){
	console.log("location data", req.query.urls);
	if(req.query.urls === "www.interparking.be"){
		res.send(locationJson);
	}else{
		res.send(locationJson);
	}	
});

// catalog get API
app.get('/orion-product/catalogs', function(req, res) {
   res.send(catalogJson);
});

// product article API
app.get('/orion-product/articles/search/findByProduct', function(req, res) {
    console.log("proudct article id data", req.query.product);
	if(req.query.product === "http://172.16.122.28:3000/orion-product/products/1"){
		res.send(productArticleJson);
	}else if(req.query.product === "http://172.16.122.28:3000/orion-product/products/2"){
		res.send(productArticleJson);
	}else if(req.query.product === "http://172.16.122.28:3000/orion-product/products/3"){
		res.send(productArticleJson);
	}else{
		res.send(productArticleJson);
	}
});

// Add to cart PUT API
app.put('/orion-order/addProductWithReferenceId', function(req, res) {
   console.log("productReferenceId data", req.query.productReferenceId);
   if(req.query.productReferenceId === "cd2aad31-e524-44c4-a35e-e296cd3754d7"){
		res.send(addtoCartJson);
	}else{
		res.send(addtoCartJson);
	}
});

//checkout PUT API
app.put('/orion-order/carts/1/checkout', function(req, res) {
	res.send(checkoutJson);
});

//Post tax calculation
app.post('/orion-taxation/calculateTax', function(req, res){
	res.send(taxCalculationJson);
});

//GET loyalty customer
app.get('/getCustomer', function(req, res){
	res.send(loyaltyCustomerJson);
});

//GET loyalty customer points
app.get('/customers/1/loyaltyAccount', function(req, res){
	res.send(customerLoyaltyPointsJson);
});

// Get cart details API
app.get('/orion-order/getCart', function(req, res){
	res.send(getCartJson);
});

//app.listen(3000);

https.createServer({
	key: fs.readFileSync('key.pem'),
	cert: fs.readFileSync('cert.pem')
}, app).listen(3000);
 
console.log('Running on port 3000');