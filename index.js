/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license	  GPL-3.0
 */
'use strict';

/**
 * Module dependencies.
 */
var logger    = require('mm-node-logger')(module);
var pkg       = require('./package.json');
var koa       = require('./lib/config/koa');
var config    = require('./lib/config/config');
var couchbase = require('./lib/config/couchbase');

const serverBanner = `
*********************************************************************************************
*
* ${pkg.description}
* @version ${pkg.version}
* @author ${pkg.author.name}
* @copyright 2014-${new Date().getFullYear()} ${pkg.author.name}
* @license ${pkg.license}
*
* ${'App started on port:'.blue} ${config.server.port} ${'- with environment:'.blue} ${config.environment}
*
*********************************************************************************************`;

couchbase.setup((initialized) => {
    // Initialize couchbase
    couchbase.init(function startServer() {
        // Initialize koa
        const app = koa.init();

        // Start up the server on the port specified in the config after we connected to couchbase
        app.listen(config.server.port, function() {
            logger.info(serverBanner);
        });

        /**
         * Expose `Application`.
         */
        module.exports = app;
    });
});
// replace laggyluke.direnv with https://github.com/motdotla/dotenv (that specific for nodejs)
