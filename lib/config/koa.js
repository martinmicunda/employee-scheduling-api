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
import i18n from 'koa-i18n';
import Boom from 'boom';
import glob from 'glob';
import cors from 'koa-cors';
import path from 'path';
import mount from 'koa-mount';
import helmet from 'koa-helmet';
import mmLogger from 'mm-node-logger';
import koaLogger from 'koa-logger';
import bodyParser from 'koa-body';
import responseTime from 'koa-response-time';
import methodOverride from 'koa-methodoverride';
import config from './config';
import i18nAdapter from './i18n';

//const logger = mmLogger(module);

/**
 * An koa class to configure koa application.
 *
 * @class
 */
class Koa {
    constructor() {
        // Initialize koa app
        this.app = koa();
    }

    /**
     * Configure app error handler.
     *
     * @method initErrorHandler
     * @api private
     */
    initErrorHandler() {
        this.app.use(function *error(next){
            try {
                // pass on the execution to downstream middlewares
                yield next;

                if (404 === this.response.status && !this.response.body) {
                    this.throw(Boom.notFound('The API endpoint not found.'));
                }
            } catch (error) {// executed only when an error occurs & no other middleware responds to the request
                if(error.status === 400) {
                    error = Boom.badRequest(error.message);
                }

                if(error.isBoom) {
                    this.body = error.output.payload;
                    this.status = error.output.statusCode;
                } else {
                    console.error('APPLICATION EXCEPTION', error.stack);
                    this.status = error.status || 500;
                    this.body = { statusCode: this.status, error: 'Internal Server Error', message: error.message };
                }
            }
        });
    }

    /**
     * Initialize application middleware.
     *
     * @method initMiddleware
     * @api private
     */
    initCommonMiddleware() {
        // Best to use at the top before any other middleware, to wrap all subsequent middleware
        this.app.use(responseTime());

        // Environment dependent middleware
        if (config.environment === 'development') {
            // Enable logger
            this.app.use(koaLogger());
        }

        // Request body parsing middleware should be above methodOverride
        this.app.use(bodyParser());
        this.app.use(methodOverride());

        //app.use(function *defaultContentTypeMiddleware(next) {
        //    this.type = 'application/json';
        //    //this.set('Content-type', 'application/json');
        //    console.log(this.header);
        //
        //    //this.response.header['Content-type'] = this.response.header['Content-type'] || 'application/json';
        //    //console.log(this.header)
        //});
        //if(!this.accepts('png')) {
        //    this.throw(406, 'json, html, or text only');
        //}

        //if(this.is('image/*')) {
        //    this.throw(415, 'images only!');
        //}
    }

    /**
     * Configure Helmet headers configuration.
     *
     * @method initHelmetHeaders
     * @api private
     */
    initHelmetHeaders() {
        // Use helmet to secure Koa headers
        this.app.use(helmet.xframe());
        this.app.use(helmet.ienoopen());
    }

    /**
     * Configure CORS (Cross-Origin Resource Sharing) headers to support Cross-site HTTP requests.
     * Read this article Using CORS - http://www.html5rocks.com/en/tutorials/cors/
     *
     * @method initCrossDomain
     * @api private
     */
    initCrossDomain() {
        const options = {
            origin: '*',
            methods: ['GET', 'POST', 'DELETE', 'PUT'],
            headers: ['Origin', 'Accept', 'Content-Type', 'X-Requested-With', 'X-CSRF-Token']
        };
        // setup CORS
        this.app.use(cors(options));
    }

    /**
     * Configure app JWT authentication.
     *
     * @method initAuthentication
     * @api private
     */
    initAuthentication() {
        //this.app.use(jwt({secret: config.token.secret}).unless({path: ['/auth/login']}));
    }

    /**
     * Configure app internationalization.
     *
     * @method initInternationalization
     * @api private
     */
    initInternationalization() {
        this.app.use(i18n(this.app, {
            directory: path.join(__dirname, '../locales'),
            locales: ['en', 'sk'],
            extension: '.json'
        }));

        this.app.use(function *setDefaultLocale(next){
            this.i18n.setLocale(config.i18n.defaultLocale);

            //  Expose global access to locale strings
            i18nAdapter.init(this.i18n);

            yield next;
        });
    }

    /**
     * Configure app routes.
     *
     * @method initRoutes
     * @api private
     */
    initRoutes() {
        // Mounting API files
        const files = glob.sync(path.join(__dirname, '../api/*/index.js'));
        files.forEach(routePath => {
            this.app.use(mount('/', require(path.resolve(routePath))));
        });
    }

    /**
     * Initialize the Koa application.
     *
     * @method init
     * @returns {Object} the koa application
     * @api public
     */
    init() {
        // Initialize error handler
        this.initErrorHandler();

        // Initialize Koa middleware
        this.initCommonMiddleware();

        // Initialize Helmet security headers
        this.initHelmetHeaders();

        // Initialize CORS
        this.initCrossDomain();

        // Initialize Authentication
        this.initAuthentication();

        // Initialize Internationalization
        this.initInternationalization();

        // Initialize routes
        this.initRoutes();

        return this.app;
    }
}

export default new Koa();
