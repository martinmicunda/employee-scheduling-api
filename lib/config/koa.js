/**
 * Koa configuration.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license	  GPL-3.0
 */
'use strict';

import jwt from 'koa-jwt';
import koa from 'koa';
import Boom from 'boom';
import glob from 'glob';
import cors from 'koa-cors';
import path from 'path';
import mount from 'koa-mount';
import helmet from 'koa-helmet';
import koaLogger from 'koa-logger';
import bodyParser from 'koa-body';
import responseTime from 'koa-response-time';
import methodOverride from 'koa-methodoverride';
import config from './config';

/**
 * Initialize application middleware.
 *
 * @method initMiddleware
 * @param {Object} app The koa application
 * @api private
 */
function initMiddleware(app) {
    // Best to use at the top before any other middleware, to wrap all subsequent middleware
    app.use(responseTime());

    // Error handler
    app.use(function *error(next){
        try {
            // pass on the execution to downstream middlewares
            yield next;

            if (404 === this.response.status && !this.response.body) {
                this.throw(Boom.notFound('The API endpoint not found.'));
            }
        } catch (error) {// executed only when an error occurs & no other middleware responds to the request
            //this.app.emit('error', err, this);
            if(error.status === 400) {
                error = Boom.badRequest(error.message);
            }

            if(error.isBoom) {
                this.body = error.output.payload;
                this.status = error.output.statusCode;
            } else {
                this.status = error.status || 500;
                this.body = { error: error.message };
            }
        }
    });

    // Environment dependent middleware
    if (config.environment === 'development') {
        // Enable logger
        app.use(koaLogger());
    }

    // Request body parsing middleware should be above methodOverride
    app.use(bodyParser());
    app.use(methodOverride());
}

/**
 * Configure Helmet headers configuration.
 *
 * @method initHelmetHeaders
 * @param {Object} app The koa application
 * @api private
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
 * @api private
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
 * Configure app JWT authentication.
 *
 * @method initAuthentication
 * @param {Object} app The koa application
 * @api private
 */
function initAuthentication(app) {
    //app.use(jwt({secret: config.token.secret}).unless({path: ['/auth/login']}));
}

/**
 * Configure app routes.
 *
 * @method initRoutes
 * @param {Object} app The koa application
 * @api private
 */
function initRoutes(app) {
    // Mounting API files
    const files = glob.sync(path.join(__dirname, '../api/*/index.js'));
    files.forEach(routePath => {
        app.use(mount('/', require(path.resolve(routePath))));
    });
}

/**
 * Initialize the Koa application.
 *
 * @method init
 * @returns {Object} the koa application
 * @api public
 */
function init() {
    // Initialize koa app
    const app = koa();

    // Initialize Koa middleware
    initMiddleware(app);

    // Initialize Helmet security headers
    initHelmetHeaders(app);

    // Initialize CORS
    initCrossDomain(app);

    // Initialize Authentication
    initAuthentication(app);

    // Initialize routes
    initRoutes(app);

    return app;
}

export {init};
