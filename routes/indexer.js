var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var logger = require('../modules/log')().get('modules');
var indexer = require('../modules/indexer')();


module.exports = function(app, passport) {

	router.use(bodyParser.json({limit: '5mb'}));

	router.post('/',  function(req, res) {
		logger.debug('Index request for: ' + JSON.stringify(req.body.uri));
		if (!req.isAuthenticated() ||  !req.user && !req.user.username !== 'admin') {
			res.json({success: false, message: 'Not authorized', details: {}});
			return;
		}

		indexer.index(req.body)
			.then(function(indexed) {
				res.json({success: true, message: 'Manifest indexed', details: indexed});
			})
			.catch(function(error) {
				res.json({success: false, message: error.message, details: error});
			});
	});

	return  router;
};

