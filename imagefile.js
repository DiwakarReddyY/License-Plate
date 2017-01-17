var express = require('express');
var router = express.Router();
var app = express();
var multer = require('multer');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var fs = require("fs");
var exec = require('child_process').exec;

var imageSchema = mongoose.Schema({
 path: {
 type: String,
 required: true,
 trim: true
 },
 originalname: {
 type: String,
 required: true
 }/*,
 b64: {
 type: String,
 required: true
 }*/
});
 
 
var Image = module.exports = mongoose.model('files', imageSchema);
 
router.getImages = function(callback, limit) {
 	Image.find(callback).limit(limit);
}
 
 
router.getImageById = function(id, callback) { 
 	Image.findById(id, callback); 
}
 
router.addImage = function(image, callback) {
 	Image.create(image, callback);
}
 
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
	cb(null, 'uploads/')
	},
	filename: function(req, file, cb) {
	cb(null, file.originalname);
	}
});
 
var upload = multer({
 	storage: storage
});
 
router.get('/', function(req, res, next) {
 	res.render('../index.ejs');
});
 
router.post('/', upload.any(), function(req, res, next) {
	 var path = req.files[0].path;
	 var imageName = req.files[0].originalname;
	 var base = new Buffer(fs.readFileSync(req.files[0].path)).toString("base64");

	 var imagepath = {};
	 imagepath['path'] = path;
	 imagepath['originalname'] = imageName;
	// imagepath['b64'] = base;
	 res.send(imagepath);

	//  router.addImage(imagepath, function(err) {
	 
	//  });

	//  res.render('user', { imagepath: imagepath}, function(err, html) {
	// 	   // ...
	//  });
	 
});

router.post("/upload", upload.any(), function(req, res, next) {
	console.log("req.files", req.files[0]);
	console.log("proudct article id data", req.query.country);
	var country = req.query.country;
	var file = req.files[0];
	var cmd = 'alpr -c'+' '+country+' '+req.files[0].path;
	console.log("cmd data", cmd);
	var data = null;
	exec(cmd, function(error, stdout, stderr) {
		// command output is in stdout
		console.log("license plate data", stdout);
		data = stdout;
	});

	var path = req.files[0].path;
	var imageName = req.files[0].originalname;
	var base = new Buffer(fs.readFileSync(req.files[0].path)).toString("base64");

	var imagepath = {};
	imagepath['path'] = path;
	imagepath['originalname'] = imageName;
	// imagepath['b64'] = base;
	router.addImage(imagepath, function(err) {

	});

	setTimeout(function(){
		var info = {
		success:true,
		plate:data.toString()
	}
	res.send(info);
	},1000);
	
});
 
module.exports = router;