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
import request from 'request';
import Promise from 'bluebird';
import couchbase from 'couchbase';
import config from './config';
import httpError from '../errors/http-error'

const logger    = require('mm-node-logger')(module);
const N1qlQuery = couchbase.N1qlQuery;

//function query(sql, done) {
//    if (config.get("cb.log") === "default") logger.debug("QUERY:", sql);
//
//    let query = N1qlQuery.fromString(sql);
//
//    db.query(query, (err, result) => {
//        if (err) {
//            console.log("ERR:", err);
//            return done(err, null);
//        }
//
//        return done(null, result);
//    });
//}

/**
 * Create couchbase connection.
 *
 * @param {*=} cb The callback that start server
 */
//https://github.com/jfelsinger/cushion-adapter-couchbase/blob/master/src%2Fadapter.js
    //https://github.com/corbinu/consul-node-demo/blob/master/src%2Flib%2Fdb.js
let bucket = null;

export function init(done) {
    logger.info(`TRYING QUERY: http://${config.couchbase.n1qlService}/query?statement=SELECT+name+FROM+system%3Akeyspaces`);

    request.get({
        "url": `http://${config.couchbase.n1qlService}/query?statement=SELECT+name+FROM+system%3Akeyspaces`,
        "auth": {
            "user": config.couchbase.user,
            "pass": config.couchbase.password,
            "sendImmediately": true
        }
    }, (err, response) => {
        if (err) {
            logger.error('INIT not ready ' + err);
            return done(false);
        }
        if (response.statusCode === 200) {
            logger.info('↳ QUERY SERVICE:UP');
            logger.info(`--TRYING:ITEM COUNT http://${config.couchbase.hosts}/pools/default/buckets/${config.couchbase.bucket}`);

            request.get({
                "url": `http://192.168.33.10:8091/pools/default/buckets/${config.couchbase.bucket}`,
                "auth": {
                    "user": config.couchbase.user,
                    "pass": config.couchbase.password,
                    "sendImmediately": true
                }
            }, (err, responseB, bodyB) => {
                if (err) {
                    logger.error('INIT not ready ' + err);

                    return done(false);
                }

                console.log(JSON.parse(bodyB).basicStats.itemCount);
                if (parseInt(JSON.parse(bodyB).basicStats.itemCount, 10) > config.couchbase.thresholdItemCount) {
                    //db = myCluster.openBucket(bucket);
                    //ODMBucket = myCluster.openBucket(bucket);
                    //
                    //query("CREATE INDEX temp ON `" + config.get("cb.bucket") + "`(non) USING " + config.get("cb.index"), (err, res) => {
                    //    if (err) {
                    //        console.log({"init": "not ready"});
                    //        return done(false);
                    //    }
                    //
                    //    if (res) {
                    //        query("SELECT COUNT(*) FROM system:indexes WHERE state='online'", (err, onlineCount) => {
                    //            if (err) {
                    //                console.log({"init": "not ready"});
                    //
                    //                return done(false);
                    //            }
                    //
                    //            if (onlineCount) {
                    //                console.log("INDEXES ONLINE:", onlineCount);
                    //                if (typeof onlineCount[0] !== "undefined") {
                    //
                    //                    if (onlineCount[0].$1 === 1) {
                    //                        query("DROP INDEX `" + config.get("cb.bucket") + "`.temp USING " + config.get("cb.index"), (err, dropped) => {
                    //                            if (err) {
                    //                                console.log({"init": "not ready"});
                    //
                    //                                return done(false);
                    //                            }
                    //                            if (dropped && status !== "online") {
                    //                                status = "online";
                    //                                console.log({"init": "ready"});
                    //
                    //                                return done(true);
                    //                            }
                    //                        });
                    //                    }
                    //                }
                    //            }
                    //        });
                    //    }
                    //});
                } else {
                    logger.error('ERROR ITEM COUNT ' + JSON.parse(bodyB).basicStats.itemCount);
                    return done(false);
                }
            });
        }
    });
}

//init(function(){});

async function createCouchbaseConnection() {
    if(!bucket) {
        const cluster = Promise.promisifyAll(new couchbase.Cluster(config.couchbase.hosts));

        try {
            bucket = await cluster.openBucket(config.couchbase.bucket);
            logger.info(`Couchbase connected to ${config.couchbase.hosts.blue} with bucket ${config.couchbase.bucket.blue}`);
        } catch(error) {
            logger.error(`Failed to make a connection to the Couchbase Server bucket '${config.couchbase.bucket}':`, error);
            throw error;
        }

        bucket.query = Promise.promisify(bucket.query);
        bucket.get = Promise.promisify(bucket.get);
        bucket.insert = Promise.promisify(bucket.insert);
        bucket.remove = Promise.promisify(bucket.remove);
        bucket.replace = Promise.promisify(bucket.replace);
        //let old = bucket.query;
        //bucket.query = query => {
        //    return new Promise((resolve, reject) => {
        //        old.call(this, query, (error, result) => {
        //            if (error) {
        //                return reject(error);
        //            }
        //            return resolve(result);
        //        });
        //    });
        //};
    }

    // create the database connection
    //const cluster = new couchbase.Cluster(config.couchbase.hosts);
    //bucket = cluster.openBucket(config.couchbase.bucket, function(err) {
    //    if (err) {
    //        logger.error(`Failed to make a connection to the Couchbase Server bucket '${config.couchbase.bucket}':`, err);
    //        return err;
    //    }
    //
    //    // when successfully connected
    //    logger.info(`Couchbase connected to ${config.couchbase.hosts.blue} with bucket ${config.couchbase.bucket.blue}`);

        //bucket.enableN1ql(config.couchbase.n1qlService);
        //let query = N1qlQuery.fromString('CREATE PRIMARY INDEX on `' + config.couchbase.bucket + '` USING ' + config.couchbase.indexType);
        //logger.info('QUERY: ', query);
        //bucket.query(query, (err, res) => {
        //    if (err) {
        //        logger.error('not ready ' + err);
        //        return;
        //    }
        //    logger.info('RES: ' + res);
        //});

    //    cb();
    //});
}
//https://github.com/corbinu/consul-node-demo/blob/24638d1ea0/src%2Flib%2Fdb.js

function dbError(error) {
    let dbError;

    switch(error.code) {
        case couchbase.errors.keyNotFound:
            dbError = httpError(404, 'The requested resource was not found.');
            break;
        case couchbase.errors.keyAlreadyExists:
            dbError = httpError(409, 'The requested resource already exists.');
            break;
        default:
            dbError = httpError(500, 'Something went wrong with DB server.');
    }

    return dbError;
}

export {createCouchbaseConnection as init, init as setup, dbError, N1qlQuery, bucket}
