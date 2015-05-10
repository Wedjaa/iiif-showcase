var express = require('express');
var configurator = require('./modules/config');
var path = require('path');
var expressWinston = require('express-winston');

var appDir = path.dirname(require.main.filename);
var configFile = path.join(appDir, "config", "iiif-gallery.json");
var environment = process.env.IIIF_ENV ?  process.env.IIIF_ENV : "development";
var logger = console;



var serviceConfig = configurator(configFile, environment);

var app = express();

serviceConfig.get("logger")
	.then(function(logconfig) {
		var logmoduleCreator = require("./modules/log/" + logconfig.module);
		logger = logmoduleCreator(logconfig.config).get("main");
		logger.info("Logger " + logconfig.module + " configured and started");
		logger.debug("Environment: " + environment + " - set IIIF_ENV to change");
		logger.info("Loading config from: " + path.join(appDir, "config", "iiif-gallery.json"));
		var webLogger = logmoduleCreator(logconfig.config).get("web");
		app.use(function(req, res, next) {
			webLogger.info("%s -  %s - %s", req.httpVersion, req.method, req.url);
			next();
		});
		return serviceConfig.get("client");
	})
	.then(function(staticPath) {
		logger.info("Serving client from: " + staticPath);
		app.use(express.static(staticPath));
		return serviceConfig.get("server.port", "3000");
	})
	.then(function(serverPort) {
		
		var server = app.listen(serverPort, function () {
		    var host = server.address().address;
		    var port = server.address().port;
		    logger.info('Example app listening at http://%s:%s', host, port);

		});
	});
