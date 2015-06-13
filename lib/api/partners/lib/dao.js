/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

var uuid     = require('node-uuid');
var logger   = require('mm-node-logger')(module);
var db       = require('../../../config/couchbase').mainBucket;
var dbErrors = require('../../../config/couchbase').errors;

const DOC_TYPE = 'partner';

/**
 * Finds a partner by ID.
 *
 * @method findByID
 * @param {String} key The partner id
 * @returns {Promise} the promise which is resolved in partner data
 * @api public
 */
function findByID(key) {
    return new Promise((resolve, reject) => {
        db.get(key, (error, result) => {
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
    let data = {};
    return new Promise((resolve, reject) => {
        db.getMulti([], (error, result) => {
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
    });
}

function insert(doc) {
    doc.id = `${DOC_TYPE}::${uuid.v1()}`;
    doc.type = DOC_TYPE; // map-reduces

    // referential document to lookup partner 'name' and prevent duplicates
    const refDocId = `${DOC_TYPE}::name::${doc.name.replace(/ /g,'').toLowerCase()}`;
    const refDoc = {
        type: `${DOC_TYPE}::name`,
        uid: doc.id
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
            db.insert(doc.id, doc, (error, result) => {
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

module.exports = {findByID, find, insert, update, remove};
