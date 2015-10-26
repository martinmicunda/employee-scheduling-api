/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license	  GPL-3.0
 */
'use strict';

import pkg from './package.json';
import * as koa from './lib/config/koa';
import config from './lib/config/config';
import couchbase from './lib/config/couchbase';

const logger = require('mm-node-logger')(module);
const banner = `
*********************************************************************************************
*
* ${pkg.description}
* @version ${pkg.version}
* @author ${pkg.author.name}
* @copyright 2014-${new Date().getFullYear()} ${pkg.author.name}
* @license ${pkg.license}
*
*********************************************************************************************`;

async function startServer() {
    console.log(banner);

    try {
        await couchbase.connect();
        logger.info(`Couchbase connected to ${config.couchbase.endPoint.blue} with bucket ${config.couchbase.bucket.blue}`);
    } catch(error) {
        logger.error(`Failed to make a connection to the Couchbase Server bucket '${config.couchbase.bucket}':`, error);
        process.exit(1);
    }

    // initialize koa
    const app = koa.init();

    // start up the server on the port specified in the config after we connected to couchbase
    app.listen(config.server.port, () => {
        logger.info(`App started on port ${config.server.port.blue} with environment ${config.environment.blue}`);
    });

    return app;
}

export default startServer();
