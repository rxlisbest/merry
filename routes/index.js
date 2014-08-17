var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/blog');

/* GET home page. */
router.get('/hello', function(req, res) {
  res.render('index', { title: 'Express' });
});
router.get('/admin/brideandgroom', function(req, res){
  req.session.name = "roy";
  var collection = db.get('merry');
  collection.findOne({"module":"brideandgroom"}, function(err, data){
    //res.send(data);
    var field = ["bride", "bride_pic", "bride_intro", "groom", "groom_pic", "groom_intro", "met", "engagement200", "engagement360", "engagement600", "engagement720", "engagement"];
    var j = {};
    for(var i in field){
		j[field[i]] = "";
    }
    for(var m in data){
		if(data[m])
			j[m] = data[m];
    }
    //res.send(j);
    res.render('index', j);
  });
});
router.post('/admin/brideandgroom', function(req, res) {
  var collection = db.get('merry');
  var fs = require("fs");
  var images = require("images");
  var d = new Date();
  var type = {'image/jpeg':'.jpg'};
  var j = {};
  collection.findOne({"module":"brideandgroom"}, function(err, data){
    //console.log(req.body);
    //console.log(req.files);
    for(var m in data){
		if(data[m])
			j[m] = data[m];
    }
    for(var n in req.body){
		if(req.body[n])
			j[n] = req.body[n];
    }
    for(var i in req.files){
	//console.log(data);
	//console.log(j);

	//console.log(req.files[i].ws.path);
	if(req.files[i].size>0){
		console.log(i);
		var filename = './public/uploads/'+i+type[req.files[i].type];
		fs.rename('./'+req.files[i].ws.path, filename, function(err, file){
			//console.log(req.files.engagement_pic.ws.path);
			if(i=="engagement_pic"){
				images(filename).size(200).save("./public/uploads/engagement200"+type[req.files[i].type], {quality:50});
				images(filename).size(360).save("./public/uploads/engagement360"+type[req.files[i].type], {quality:50});
				images(filename).size(600).save("./public/uploads/engagement600"+type[req.files[i].type], {quality:50});
				images(filename).size(720).save("./public/uploads/engagement720"+type[req.files[i].type], {quality:50});
				fs.unlink(filename);
			}
			else{
				images(filename).size(88).save(filename, {quality:50});
			}
		});
		if(i=="engagement_pic"){
			j["engagement200"] = "/uploads/engagement200"+type[req.files[i].type];
			j["engagement360"] = "/uploads/engagement360"+type[req.files[i].type];
			j["engagement600"] = "/uploads/engagement600"+type[req.files[i].type];
			j["engagement720"] = "/uploads/engagement720"+type[req.files[i].type];
		}
		else{
			j[i] = '/uploads/'+i+type[req.files[i].type];
		}
	}
    }
    //console.log(j);
    if(data==null){
	j["module"] = "brideandgroom";
    	collection.insert(j);
    }
    else{
    	collection.update({"module":"brideandgroom"},{$set:j}, {multi:true});
    }
    res.redirect("/admin/brideandgroom");

    //console.log(data);
    //res.render('index', data);
    //collection.update({'engagement':'123123',"module":"brideandgroom"},{$set:{"bride":"nono"}}, {multi:true});
  });
});

module.exports = router;
