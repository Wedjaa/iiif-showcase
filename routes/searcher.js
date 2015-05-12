var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var logger = require('../modules/log')().get('modules');
var indexer = require('../modules/indexer')();

router.use(bodyParser.json());

router.post('/suggest', function(req, res) {
	logger.debug('Search request for: ' + JSON.stringify(req.body.uri));
	indexer.advancedSuggest(req.body)
		.then(function(suggestions) {
			res.json({success: true, message: 'Returning suggestions', details: suggestions});
		})
		.catch(function(error) {
			res.json({success: false, message: error.message, details: error});
		});
});

router.get('/suggest/:hint', function(req, res) {
	logger.debug('Search request for: ' + JSON.stringify(req.params['hint']));
	indexer.suggest({value: req.params['hint']})
		.then(function(suggestions) {
			res.json({succcess: true, message: 'Returning suggestions', details: suggestions});
		})
		.catch(function(error) {
			res.json({success: false, message: error.message, details: error});
		});
});

module.exports = router;

