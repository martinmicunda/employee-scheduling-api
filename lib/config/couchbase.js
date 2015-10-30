/**
 * This module is an adapter for connecting to a Couchbase Server.
 *
 * @module couchbase
 * @example
 * ```js
 * import couchbase from './couchbase';
 *
 * async function startServer() {
 *    try {
 *        await couchbase.connect();
 *    } catch(error) {
 *        console.error('Could not connect to Couchbase!', error);
 *    }
 * };
 * ```
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Promise from 'bluebird';
import mmLogger from 'mm-node-logger';
import couchbase from 'couchbase';
import config from './config';
import httpError from '../errors/http-error';

const logger = mmLogger(module);

/**
 * An adapter class for dealing with a Coucbase Server.
 *
 * @class
 */
class CouchbaseAdapter {
    constructor() {
        this.bucket = null;
        this.N1qlQuery = couchbase.N1qlQuery;
        this.bucketName = config.couchbase.bucket;
    }

    /**
     * Create a connection to a Couchbase bucket.
     *
     * @throws Will throw an error if it failed to connect to a Couchbase bucket.
     */
    async connect() {
        const cluster = Promise.promisifyAll(new couchbase.Cluster(config.couchbase.endPoint));

        try {
            this.bucket = await cluster.openBucket(config.couchbase.bucket);
            //this.bucket.operationTimeout = 60 * 1000; // 60 seconds operation timeout (LCB_CNTL_OP_TIMEOUT)
        } catch(error) {
            throw error;
        }

        // TODO(martin): find out why it's throwing an error "this._n1ql is not a function"
        // when converting cb to promise
        //this.query = Promise.promisify(this.bucket.query);
        //this.get = Promise.promisify(this.bucket.get);
        //this.insert = Promise.promisify(this.bucket.insert);
        //this.remove = Promise.promisify(this.bucket.remove);
        //this.replace = Promise.promisify(this.bucket.replace);
    }

    /**
     * Shuts down the couchbase connection.
     */
    disconnect() {
        this.bucket.disconnect(); // TODO: why disconnect doesn't accept cb?
        this.bucket = null;
    }

    get(key, options) {
        options = options || {};
        return new Promise((resolve, reject) => {
            this.bucket.get(key, options, (error, result) => {
                if (error) {
                    return reject(error);
                }
                return resolve(result);
            });
        });
    }

    query(query, params) {
        return new Promise((resolve, reject) => {
            this.bucket.query(query, params, (error, result) => {
                if (error) {
                    return reject(error);
                }
                return resolve(result);
            });
        });
    }

    insert(key, value, options) {
        return new Promise((resolve, reject) => {
            this.bucket.insert(key, value, options, (error, result) => {
                if (error) {
                    return reject(error);
                }
                return resolve(result);
            });
        });
    }

    remove(key, options) {
        options = options || {};
        return new Promise((resolve, reject) => {
            this.bucket.remove(key, options, (error, result) => {
                if (error) {
                    return reject(error);
                }
                return resolve(result);
            });
        });
    }

    replace(key, value, options) {
        return new Promise((resolve, reject) => {
            this.bucket.replace(key, value, options, (error, result) => {
                if (error) {
                    return reject(error);
                }
                return resolve(result);
            });
        });
    }

    handleError(error) {
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
}

const db = new CouchbaseAdapter();
export default db;

// if the Node process ends, close the Couchbase connection
process.on('SIGINT', () => {
    db.disconnect();
    logger.info('Couchbase disconnected through app termination');
    process.exit(0);
});

// http://developer.couchbase.com/documentation/server/4.0/rest-api/rest-bucket-flush.html
// https://github.com/ToddGreenstein/try-cb-nodejs/blob/2151d169d5b4f43769c8910794d1b4bf39182fa9/config.json
// https://github.com/corbinu/consul-node-demo/blob/24638d1ea0/src%2Flib%2Fdb.js

