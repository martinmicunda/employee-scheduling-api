/**
 * Koa configuration.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license	  GPL-3.0
 */
'use strict';

/**
 * Module dependencies.
 */
var koa            = require('koa');
var cors           = require('koa-cors');
var path           = require('path');
var join           = require('path').join;
var mount          = require('koa-mount');
var helmet         = require('koa-helmet');
//var multer         = require('multer');
//var logger         = require('mm-node-logger')(module);
var koaLogger      = require('koa-logger');
var bodyParser     = require('koa-body');
var errorHandler   = require('koa-error');
var responseTime   = require('koa-response-time');
var methodOverride = require('koa-methodoverride');
var config         = require('./config');
var pathUtils      = require('../utils/path-utils');

/**
 * Initialize application middleware.
 *
 * @method initMiddleware
 * @param {Object} app The koa application
 * @private
 */
function initMiddleware(app) {
    // Best to use at the top before any other middleware, to wrap all subsequent middleware
    app.use(responseTime());

    // Environment dependent middleware
    if (config.environment === 'development') {
        // Enable logger
        app.use(koaLogger());
    }

    app.use(errorHandler());

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser());
    app.use(methodOverride());

    // Add multipart handling middleware
    //app.use(multer({
    //    dest: './uploads/',
    //    inMemory: config.uploadFilesInMemory
    //}));
    //
    //// Setting router and the static folder for uploaded files
    //app.use('/uploads', express.static(path.resolve('./uploads')));
}

/**
 * Configure Helmet headers configuration.
 *
 * @method initHelmetHeaders
 * @param {Object} app The koa application
 * @private
 */
function initHelmetHeaders(app) {
    // Use helmet to secure Koa headers
    app.use(helmet.xframe());
    app.use(helmet.ienoopen());
}

/**
 * Configure CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests.
 * Read this article Using CORS - http://www.html5rocks.com/en/tutorials/cors/
 *
 * @method initCrossDomain
 * @param {Object} app The koa application
 * @private
 */
function initCrossDomain(app) {
    let options = {
        origin: '*',
        methods: ['GET', 'POST', 'DELETE', 'PUT'],
        headers: ['Origin', 'Accept', 'Content-Type', 'X-Requested-With', 'X-CSRF-Token']
    };
    // setup CORS
    app.use(cors(options));
}

/**
 * Configure app modules config files.
 *
 * @method initGonfig
 * @param {Object} app The koa application
 * @private
 */
function initGonfig(app) {
    // Globbing config files
    pathUtils.getGlobbedPaths(join(__dirname, '../**/*.config.js')).forEach(function (routePath) {
        require(path.resolve(routePath))(app);
    });
}

/**
 * Configure app routes.
 *
 * @method initRoutes
 * @param {Object} app The koa application
 * @private
 */
function initRoutes(app) {
    // Mounting API files
    pathUtils.getGlobbedPaths(join(__dirname, '../api/*/index.js')).forEach(function (routePath) {
        app.use(mount('/', require(path.resolve(routePath))));
    });
}

///**
// * Configure error handling.
// *
// * @method initErrorRoutes
// * @param {Object} app The express application
// * @private
// */
//function initErrorRoutes(app) {
//    // Assume 'not found' in the error msgs is a 404. this is somewhat silly, but valid, you can do whatever you like, set properties, use instanceof etc.
//    app.use(function (err, req, res, next) {
//        // If the error object doesn't exists
//        if (!err) return next();
//
//        // Log it
//        logger.error('Internal error(%d): %s', res.statusCode, err.stack);
//
//        // Redirect to error page
//        res.sendStatus(500);
//    });
//
//    // Assume 404 since no middleware responded
//    app.use(function (req, res) {
//        // Redirect to not found page
//        res.sendStatus(404);
//    });
//}
//
/**
 * Populate DB with sample data.
 *
 * @method initDB
 * @private
 */
function initDB() {
    if(config.seedDB) {
        require('./seed');
    }
}
/**
 * Initialize the Koa application.
 *
 * @method init
 * @returns {Object} the koa application
 */
function init() {
    // Initialize koa app
    const app = koa();

    // Initialize Express middleware
    initMiddleware(app);

    // Initialize Helmet security headers
    initHelmetHeaders(app);

    // Initialize CORS
    initCrossDomain(app);

    // Initialize config
    //initGonfig(app);

    // Initialize routes
    initRoutes(app);

    //// Initialize error routes
    //initErrorRoutes(app);

    // Initialize DB with sample data
    initDB();

    return app;
}

module.exports.init = init;
