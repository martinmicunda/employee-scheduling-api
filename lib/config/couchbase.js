/**
 * This module follow best practice for creating, maintaining and using a Mongoose connection like:
 *  - open the connection when the app process start
 *  - start the app server when after the database connection is open (optional)
 *  - monitor the connection events (`connected`, `error` and `disconnected`)
 *  - close the connection when the app process terminates
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license	  GPL-3.0
 */
'use strict';

/**
 * Module dependencies.
 */
let logger    = require('mm-node-logger')(module);
let couchbase = require('couchbase');
let config    = require('./config');

/**
 * Create couchbase connection.
 *
 * @param {*=} cb The callback that start server
 */
//https://github.com/jfelsinger/cushion-adapter-couchbase/blob/master/src%2Fadapter.js
var mainBucket = null;
function createCouchbaseConnection(cb) {
    if(mainBucket) { return cb(null); }

    // create the database connection
    const cluster = new couchbase.Cluster(config.couchbase.hosts);
    mainBucket = cluster.openBucket(config.couchbase.bucket, function(err) {
        if (err) {
            logger.error('Failed to make a connection to the Couchbase cluster: ', err);
            return err;
        }

        // when successfully connected
        logger.info(`Couchbase connected to ${config.couchbase.hosts.blue} with bucket ${config.couchbase.bucket.blue}`);

        cb();
    });
    module.exports.mainBucket = mainBucket;
}
module.exports.errors = couchbase.errors;
module.exports.init = createCouchbaseConnection;
