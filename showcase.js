var express = require('express');
var configurator = require('./modules/config');
var path = require('path');
var expressWinston = require('express-winston');

var appDir = path.dirname(require.main.filename);
var configFile = path.join(appDir, "config", "iiif-gallery.json");
var environment = process.env.IIIF_ENV ?  process.env.IIIF_ENV : "development";
var logger = console;
var Indexer;
var indexerClient;

var serviceConfig = configurator(configFile, environment);

var app = express();

serviceConfig.get("logger")
	.then(function(logconfig) {
		var logCreator = require("./modules/log")(logconfig);
		console.log("Logger: " + logCreator);
		logger = logCreator.get("main");
		logger.debug("Environment: " + environment + " - set IIIF_ENV to change");
		logger.info("Loading config from: " + path.join(appDir, "config", "iiif-gallery.json"));
		var webLogger = logCreator.get("web");
		app.use(function(req, res, next) {
			webLogger.info("%s -  %s - %s", req.httpVersion, req.method, req.url);
			next();
		});
		return serviceConfig.get("client");
	})
	.then(function(staticPath) {
		logger.info("Serving client from: " + staticPath);
		app.use(express.static(staticPath));
		return serviceConfig.get("elastic");
	})
	.then(function(es_config) {
		logger.info("Configuring ElasticClient: " + JSON.stringify(es_config));
		Indexer = require('./modules/indexer');
		indexerClient = Indexer(es_config);
		return indexerClient.prepare('iiif-gallery');
	})
	.then(function(indexReady) {
		logger.info('Index state: ' + JSON.stringify(indexReady));
		return serviceConfig.get("server.port", "3000");
	})
	.then(function(serverPort) {

		// Ok - everything is setup, mount the routes
		app.use('/api/index', require('./routes/indexer'));		
		app.use('/api/search', require('./routes/searcher'));		

		var server = app.listen(serverPort, function () {
		    var host = server.address().address;
		    var port = server.address().port;
		    logger.info('Example app listening at http://%s:%s', host, port);

		});
	});
