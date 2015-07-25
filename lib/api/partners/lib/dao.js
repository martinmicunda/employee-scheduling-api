/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

var logger = require('mm-node-logger')(module);
import uuid from 'node-uuid';
import { bucket as db, errors as dbErrors, N1qlQuery } from '../../../config/couchbase';

const DOC_TYPE = 'partner';

// The setTimeout function is initially called with 30 retries, and the retry delay is set
// to 1000 milliseconds, which we chose because 30 seconds happens to be the minimum automatic
// failover interval we can configure in Couchbase.
const RETRIES     = 30;
const RETRY_DELAY = 1000;

function retryErrorHandler(fn, retryDelay, data, retries, error, reject, queryName) {
    if(error.code === dbErrors.connectError && retries > 0) {
        logger.error(`DB ${queryName} - ${DOC_TYPE}: `, error.message);

        // Let the failover mechanism take its time and retry the operation number of times
        // to see if the problem gets resolved. If the problem doesn't get resolved then
        // report a failure.
        setTimeout(fn, retryDelay, data, retries - 1);
    } else {
        if (error.code === dbErrors.keyNotFound) {
            error.statusCode = 404;
        } else {
            error.statusCode = 500;
        }

        logger.error(`DB ${queryName} - ${DOC_TYPE}: `, error.message);

        return reject(error);
    }
}

/**
 * Finds a partner by ID.
 *
 * @method findByID
 * @param {String} key The partner id
 * @returns {Promise} the promise which is resolved in partner data
 * @api public
 */
function findByID(key) {
    //let retries = RETRIES;

    return new Promise((resolve, reject) => {

        //let retryDone = (error, result) => {
        //    if(error) {
        //        return retryErrorHandler(findByIDWithRetry, RETRY_DELAY, key, retries--, error, reject, 'findByID');
        //    } else {
        //        result.value.version = result.cas;
        //        // type value is specific to couchbase and it's not required for application level
        //        delete result.value.type;
        //
        //        return resolve(result.value);
        //    }
        //};
        //
        //function findByIDWithRetry() {
        //    db.get(key, retryDone);
        //}
        //findByIDWithRetry();


        db.get(`${DOC_TYPE}::${key}`, (error, result) => {
            if(error) {
                if(error.code === dbErrors.keyNotFound) {
                    error.statusCode = 404;
                } else {
                    error.statusCode = 500;
                }

                logger.error(`DB findByID - ${DOC_TYPE}: `, error.message);

                return reject(error);
            }

            result.value.version = result.cas;
            // type value is specific to couchbase and it's not required for application level
            delete result.value.type;

            return resolve(result.value);
        });
    });
}

function find() {
    const query = N1qlQuery.fromString(`SELECT * FROM default WHERE type = 'partner'`);

    //let data = {};
    return new Promise((resolve, reject) => {
        db.query(query, (error, result) => {
            if(error) {
                if(error.code === dbErrors.keyNotFound) {
                    error.statusCode = 404;
                }
                else {
                    error.statusCode = 500;
                }

                logger.error(`DB find - ${DOC_TYPE}: `, error.message);

                return reject(error);
            }
            //data = result.value;
            //data.cas = result.cas;

            return resolve(result);
        });
        //db.getMulti([], (error, result) => {
        //    if(error) {
        //        if(error.code === dbErrors.keyNotFound) {
        //            error.statusCode = 404;
        //        }
        //        else {
        //            error.statusCode = 500;
        //        }
        //
        //        logger.error(`DB find - ${DOC_TYPE}: `, error.message);
        //
        //        return reject(error);
        //    }
        //    //data = result.value;
        //    //data.cas = result.cas;
        //
        //    return resolve(result);
        //});
    });
}

function insert(doc) {
    doc.id = uuid.v1();
    doc.type = DOC_TYPE; // map-reduces

    // referential document to lookup partner 'name' and prevent duplicates
    const refDocId = `${DOC_TYPE}::name::${doc.name.replace(/ /g,'').toLowerCase()}`;
    const refDoc = {
        type: `${DOC_TYPE}::name`,
        partnerId: doc.id
    };

    return new Promise((resolve, reject) => {
        // insert referential document first
        db.insert(refDocId, refDoc, (error) => {
            if(error) {
                if(error.code === dbErrors.keyAlreadyExists) {
                    error.statusCode = 409;
                } else {
                    error.statusCode = 500;
                }

                logger.error(`DB insert - ${refDoc.type}: `, error.message);

                return reject(error);
            }

            // insert partner document
            db.insert(`${DOC_TYPE}::${doc.id}`, doc, (error, result) => {
                if(error) {
                    if(error.code === dbErrors.keyAlreadyExists) {
                        error.statusCode = 409;
                    } else {
                        error.statusCode = 500;
                    }

                    logger.error(`DB insert - ${doc.type}: `, error.message);

                    return reject(error);
                }

                result.id = doc.id;
                result.version = result.cas;
                delete result.cas;

                return resolve(result);
            });
        });
    });
}

function update(doc) {
    const cas = doc.version;
    doc.type = DOC_TYPE; // map-reduces
    // do not store CAS(version) as Couchbase already keep this in key metadata for each document
    delete doc.version;

    return new Promise((resolve, reject) => {
        db.replace(doc.id, doc, {cas: cas}, (error, result) => {
            if(error) {
                if(error.code === dbErrors.keyNotFound) {
                    error.statusCode = 404;
                } else if(error.code === dbErrors.keyAlreadyExists) {
                    error.statusCode = 409; // document was changed - concurrency CAS error
                } else {
                    error.statusCode = 500;
                }

                logger.error('DB update: ', error.message);

                return reject(error);
            }

            result.version = result.cas;
            delete result.cas;

            return resolve(result);
        });
    });
}

function remove(key) {
    // Get user document by ID
    // remove user lookup by email that you get from user details
    // remove user (do rollback if remove unique value pass but partner can't be remove for some reason)
    return new Promise((resolve, reject) => {
        db.remove(key, (error) => {
            if(error) {
                if(error.code === dbErrors.keyNotFound) {
                    error.statusCode = 404;
                } else {
                    error.statusCode = 500;
                }

                logger.error(`DB remove - ${DOC_TYPE}: `, error.message);

                return reject(error);
            }

            return resolve();
        });
    });
}

export {findByID, find, insert, update, remove};

// curl -v http://localhost:8093/query/service -d "statement=SELECT * FROM default"
// curl -v http://localhost:8093/query/service -d "statement=SELECT * FROM default WHERE type = 'partner'"
// curl -v http://localhost:8093/query?statement=SELECT+*+FROM+default
