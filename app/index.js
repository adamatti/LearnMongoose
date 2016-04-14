'use strict';

const mongoose = require('mongoose'),
      Promise = require('bluebird').Promise,
      uuid = require('node-uuid'),
      logger = require('log4js').getLogger("learn"),
      config = {
		url : "mongodb://docker.me:27017/learn"	
      }
;
///////////////////////////////////////////////////////////////////////////////////////////////////////////
function doConnect(){
	return new Promise((resolve, reject) => {
		var db = mongoose.createConnection();
		db.on('error', function (err) {
			reject(err);
		});

		db.once('open', function callback () {
			resolve(db);
		});
		
		db.open(config.url);
	});
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
function cb(resolve, reject){
    return function(error, result){
        if (error){
            reject(error);
        } else {
            resolve(result);
        }
    }    
}
///////////////////////////////////////////////////////////////////////////////////////////////////////////
var scope = {
    obj: {
        name: "adamatti"
    }
};
///////////////////////////////////////////////////////////////////////////////////////////////////////////
return doConnect()
.then( db =>{
	scope.db = db;
	scope.model = db.model("testTable",{
        _id : {
            type : String,
            default : function() {
              const id = uuid.v4();
              logger.trace("creating id %s",id);
              return id;
            }
        }
        ,name : {type: String}
    });
	logger.debug("Connected")
}).then( () =>{	
	logger.info("Inserting")
    return new Promise((resolve, reject) => {
        scope.model.create(scope.obj, function (error, resource) {
            if (error){
                reject(error);
            } else {
                resolve(resource);
            }
        });
    });
}).then( obj =>{
    logger.debug("Inserted: ", obj);
    
    logger.info("Updating")
    
    scope.obj = obj;
    scope.obj.name = "adamatti 2";
    return new Promise((resolve, reject) => {
        scope.model.findByIdAndUpdate(scope.obj.id,scope.obj,cb(resolve, reject));
    });
}).then( obj =>{
    logger.debug("Updated: ", obj);
    
    scope.obj = obj;
	
    logger.info("Listing");
    return new Promise((resolve, reject) => {
        scope.model.find({}).exec(cb(resolve, reject));
    });
}).then( list =>{
    logger.debug("List:\n",list);
	
    logger.info("Finding by Id");
    return new Promise((resolve, reject) => {
        scope.model.findById(scope.obj._id, cb(resolve, reject));
    });
}).then( obj =>{
    logger.debug("Found by id: ", obj);
    scope.obj = obj;
    
    logger.info("Deleting");
    
    return new Promise((resolve, reject) => {
        scope.model.findByIdAndRemove(scope.obj.id,cb(resolve, reject));
    });
}).then( obj =>{
    scope.obj = obj;
    logger.debug("Deleted: ", obj);
	logger.info("All working")
}).catch(error => {
	logger.error("Error: ",error);
})