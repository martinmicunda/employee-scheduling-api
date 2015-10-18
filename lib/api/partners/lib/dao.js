/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

var logger = require('mm-node-logger')(module);
import uuid from 'node-uuid';
import httpError from '../../../errors/http-error.js'
import { bucket as db, dbError, N1qlQuery } from '../../../config/couchbase';

const DOC_TYPE = 'partner';

function getDocId(id) {
    return `${DOC_TYPE}::${id}`;
}

function getRefDocId(doc) {
    return `${DOC_TYPE}::name::${doc.name.replace(/ /g,'').toLowerCase()}`
}

function getRefDoc(doc) {
    return {
        type: `${DOC_TYPE}::name`,
        partnerId: doc.id
    };
}

/**
 * Finds a partner by ID.
 *
 * @method findByID
 * @param {String} key The partner id
 * @returns {Promise} the promise which is resolved in partner data
 * @api public
 */
async function findByID(id) {
    try {
        const data = await db.get(getDocId(id));
        data.value.cas = data.cas;

        return data.value;
    } catch(error) {
        logger.error(`DB findByID - ${DOC_TYPE} -`, error.message);
        throw dbError(error);
    }
}

async function find() {
    const query = N1qlQuery.fromString(`SELECT default.* FROM default WHERE type = "${DOC_TYPE}" ORDER BY name`);

    try {
        return await db.query(query);
    } catch(error) {
        logger.error(`DB find - ${DOC_TYPE} -`, error.message);

        throw dbError(error);
    }
}

async function insertRefDoc(doc) {
    // referential document to lookup partner 'name' and prevent duplicates
    const refDocId = getRefDocId(doc);
    const refDoc = getRefDoc(doc);

    try {
        await db.insert(refDocId, refDoc, {persist_to: 1, replicate_to: 1});
    } catch(error) {
        logger.error(`DB insert - ${refDoc.type} -`, `${error.message}`);

        throw dbError(error);
    }
}

async function insert(doc) {
    doc.id = uuid.v1();
    doc.type = DOC_TYPE; // map-reduces

    // insert unique referential document first
    try {
        await insertRefDoc(doc);
    } catch(error) {
        throw error;
    }

    // and then insert document
    try {
        const data = await db.insert(getDocId(doc.id), doc, {persist_to: 1, replicate_to: 1});
        data.id = doc.id;

        return data;
    } catch(error) {
        // do a rollback and remove referential document
        try {
            await removeRefDoc(doc);
            logger.error(`DB insert - ${DOC_TYPE} -`, error.message);

            throw dbError(error);
        } catch(error) {
            throw error;
        }
    }

    // TODO: Keep that as an example for blog post
    //return new Promise((resolve, reject) => {
    //    // insert referential document first
    //    db.insert(refDocId, refDoc, (error) => {
    //        if(error) {
    //            if(error.code === dbErrors.keyAlreadyExists) {
    //                error.statusCode = 409;
    //            } else {
    //                error.statusCode = 500;
    //            }
    //
    //            logger.error(`DB insert - ${refDoc.type}: `, error.message);
    //
    //            return reject(error);
    //        }
    //
    //        // insert partner document
    //        db.insert(`${DOC_TYPE}::${doc.id}`, doc, (error, result) => {
    //            if(error) {
    //                if(error.code === dbErrors.keyAlreadyExists) {
    //                    error.statusCode = 409;
    //                } else {
    //                    error.statusCode = 500;
    //                }
    //
    //                logger.error(`DB insert - ${doc.type}: `, error.message);
    //
    //                return reject(error);
    //            }
    //
    //            result.id = doc.id;
    //            result.version = result.cas;
    //            delete result.cas;
    //
    //            return resolve(result);
    //        });
    //    });
    //});
}

async function update(doc) {
    const cas = doc.cas;
    doc.type = DOC_TYPE; // map-reduces
    // do not store CAS(version) as Couchbase already keep this in key metadata for each document
    delete doc.cas;

    try {
        const docOld = await findByID(doc.id);
        if(docOld.name !== doc.name) {
            // TODO: add steps when unique value is changed
        }

        return await db.replace(getDocId(doc.id), doc, {cas: cas});
    } catch(error) {
        logger.error(`DB update - ${DOC_TYPE} -`, error.message);

        throw dbError(error);
    }
}

async function removeRefDoc(doc) {
    const refDocId = getRefDocId(doc);
    const refDoc = getRefDoc(doc);

    try {
        await db.remove(refDocId);
    } catch(error) {
        logger.error(`DB remove - ${refDoc.type} -`, `${error.message}`);

        throw dbError(error);
    }
}

async function remove(id) {
    let doc;

    // remove unique referential document first
    try {
        doc = await findByID(id);
        await removeRefDoc(doc);
    } catch(error) {
        throw error;
    }

    // and then remove document
    try {
        await db.remove(getDocId(doc.id));
    } catch(error) {
        // do a rollback and insert referential document
        try {
            await insertRefDoc(doc);
            logger.error(`DB remove - ${DOC_TYPE} -`, error.message);

            throw dbError(error);
        } catch(error) {
            throw error;
        }
    }
}

export {findByID, find, insert, update, remove};

// curl -v http://localhost:8093/query/service -d "statement=SELECT * FROM default"
// curl -v http://192.168.33.10:8093/query/service -d "statement=SELECT * FROM default WHERE type = 'partner'"
// curl -v http://localhost:8093/query?statement=SELECT+*+FROM+default


//http://pouchdb.com/2015/03/05/taming-the-async-beast-with-es7.html
// https://github.com/couchbaselabs/gameapi-nodejs/blob/master/models%2Faccountmodel.js !!
