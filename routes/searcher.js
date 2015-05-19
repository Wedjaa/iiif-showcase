var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var logger = require('../modules/log')().get('modules');
var indexer = require('../modules/indexer')();

module.exports = function(app, passport) {
	router.use(bodyParser.json());

	router.post('/query', function(req, res) {
		logger.debug('Search query for: ' + JSON.stringify(req.body));
		indexer.search(req.body.terms)
			.then(function(results) {
				res.json({success: true, message: 'Returning search results', details: results});
			})
			.catch(function(error) {
				res.json({success: false, message: error.message, details: error});
			});
	});

	router.post('/suggest', function(req, res) {
		logger.debug('Suggest request for: ' + JSON.stringify(req.body));
		indexer.advancedSuggest(req.body)
			.then(function(suggestions) {
				res.json({success: true, message: 'Returning suggestions', details: suggestions});
			})
			.catch(function(error) {
				res.json({success: false, message: error.message, details: error});
			});
	});

	router.get('/suggest/:hint', function(req, res) {
		logger.debug('Suggest request for: ' + JSON.stringify(req.params['hint']));
		indexer.suggest({value: req.params['hint']})
			.then(function(suggestions) {
				res.json({succcess: true, message: 'Returning suggestions', details: suggestions});
			})
			.catch(function(error) {
				res.json({success: false, message: error.message, details: error});
			});
	});

	return router;

}


