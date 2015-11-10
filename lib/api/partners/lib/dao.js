/**
 * The partnerDAO module that provides an abstract interface to database
 * with CRUD operations.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import uuid from 'node-uuid';
import mmLogger from 'mm-node-logger';
import db from '../../../config/couchbase';

const logger = mmLogger(module);
const DOC_TYPE = 'partner';
const REF_DOC_TYPE = `${DOC_TYPE}::name`;

/**
 * Generate reference document compound id.
 *
 * @param {Object} doc - The partner document
 * @param {String} doc.name - The partner name
 * @returns {String} the reference document compound id
 * @api private
 */
function generateRefDocId(doc) {
    return `${DOC_TYPE}::${doc.name.replace(/ /g,'').toLowerCase()}`
}

/**
 * Retrieves a partner by ID from DB.
 *
 * @param {String} id - The partner id
 * @returns {Object} the partner
 * @throws {Error} Will throw an error if it failed to retrieve a partner from DB.
 * @api public
 */
async function findByID(id) {
    try {
        const data = await db.get(id);

        return Object.assign({id: id, cas: data.cas}, data.value);
    } catch(error) {
        logger.error(`DB findByID - ${DOC_TYPE} -`, error.message);
        throw db.handleError(error);
    }
}

/**
 * Retrieves list of partners from DB.
 *
 * @returns {Array.<Object>} the array that contains list of partners
 * @throws {Error} Will throw an error if it failed to retrieve a partners from DB.
 * @api public
 */
async function find() {
    const query = db.N1qlQuery.fromString(`SELECT meta().cas, meta().id, \`${db.bucketName}\`.* FROM \`${db.bucketName}\` WHERE type = '${DOC_TYPE}' ORDER BY name`);

    try {
        return await db.query(query);
    } catch(error) {
        logger.error(`DB find - ${DOC_TYPE} -`, error.message);

        throw db.handleError(error);
    }
}

/**
 * Creates a partner reference document in DB to lookup partner 'name' and prevent duplicates.
 *
 * @param {Object} doc - The partner document
 * @param {String} doc.name - The partner name
 * @param {String} refId - The referential document id
 * @throws {Error} Will throw an error if it failed to create a partner ref document in DB.
 * @api private
 */
async function insertRefDoc(doc, refId) {
    const refDocId = generateRefDocId(doc);
    const refDoc = {
        partnerId: refId
    };

    try {
        await db.insert(refDocId, refDoc, db.durabilityOptions);
    } catch(error) {
        logger.error(`DB insert - ${REF_DOC_TYPE} -`, `${error.message}`);

        throw db.handleError(error);
    }
}

/**
 * Creates a partner document in DB.
 *
 * @param {Object} doc - The partner document
 * @param {String} doc.name - The partner name
 * @param {String} doc.contactPerson - The partner contact person
 * @param {String} doc.email - The partner email
 * @param {String} doc.phoneNumber - The partner phone number
 * @param {String} doc.color - The partner color
 * @param {String} doc.status - The partner status
 * @param {String} doc.note - The partner note
 * @param {String} [id=uuid] - The partner id
 * @throws {Error} Will throw an error if it failed to create a partner document in DB.
 * @api public
 */
async function insert(doc, id = uuid.v1()) {
    doc.type = DOC_TYPE; // map-reduces

    // insert unique referential document first
    await insertRefDoc(doc, id);

    // and then insert document
    try {
        const data = await db.insert(id, doc, db.durabilityOptions);
        data.id = id;

        return data;
    } catch(error) {
        // do a rollback and remove referential document
        await removeRefDoc(doc);

        logger.error(`DB insert - ${DOC_TYPE} -`, error.message);
        throw db.handleError(error);
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
    //            logger.error(`DB insert - ${REF_DOC_TYPE}: `, error.message);
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

/**
 * Updates a partner document in DB.
 *
 * @param {String} id - The partner id
 * @param {Object} doc - The partner document
 * @param {String} doc.id - The partner id
 * @param {String} doc.name - The partner name
 * @param {String} doc.contactPerson - The partner contact person
 * @param {String} doc.email - The partner email
 * @param {String} doc.phoneNumber - The partner phone number
 * @param {String} doc.color - The partner color
 * @param {String} doc.status - The partner status
 * @param {String} doc.note - The partner note
 * @param {String} doc.cas - The couchbase cas value
 * @throws {Error} Will throw an error if it failed to update a partner document in DB.
 * @api public
 */
async function update(id, doc) {
    let cas = doc.cas;
    // do not store CAS(version) and document ID as Couchbase already keep these values in metadata for each document
    doc = db.removeMetadataFromDoc(doc);
    doc.type = DOC_TYPE; // map-reduces

    const docOld = await findByID(id);
    // check if unique value has changed
    if(docOld.name !== doc.name) {
        // 1. insert new ref doc first
        await insertRefDoc(doc, id);
        // 2. update doc
        try {
            cas = await db.replace(id, doc, {cas: cas});
        } catch(error) {
            // do a rollback and remove new ref doc
            await removeRefDoc(doc);

            // handle db.replace error
            logger.error(`DB update - ${DOC_TYPE} -`, error.message);
            throw db.handleError(error);
        }
        // 3. delete old ref doc
        try {
            await removeRefDoc(docOld);
        } catch(error) {
            // do a rollback and remove new ref doc
            await removeRefDoc(doc);
            // do a rollback and revert old doc
            try {
                await db.replace(id, docOld, {cas: cas});
            } catch(error) {
                logger.error(`DB update - ${DOC_TYPE} -`, error.message);
                throw db.handleError(error);
            }
        }

        return cas;
    }

    try {
        return await db.replace(id, doc, {cas: cas});
    } catch(error) {
        logger.error(`DB update - ${DOC_TYPE} -`, error.message);

        throw db.handleError(error);
    }
}

/**
 * Removes a partner reference document from DB to lookup partner 'name' and prevent duplicates.
 *
 * @param {Object} doc - The partner document
 * @param {String} doc.name - The partner name
 * @throws {Error} Will throw an error if it failed to remove a partner ref document from DB.
 * @api private
 */
async function removeRefDoc(doc) {
    const refDocId = generateRefDocId(doc);

    try {
        await db.remove(refDocId);
    } catch(error) {
        logger.error(`DB remove - ${REF_DOC_TYPE} -`, `${error.message}`);

        throw db.handleError(error);
    }
}

/**
 * Removes a partner document from DB.
 *
 * @param {String} id - The partner id
 * @throws {Error} Will throw an error if it failed to remove a partner document from DB.
 * @api public
 */
async function remove(id) {
    // remove unique referential document first
    const doc = await findByID(id);
    await removeRefDoc(doc);

    // and then remove document
    try {
        await db.remove(id);
    } catch(error) {
        // do a rollback and insert referential document
        await insertRefDoc(doc, id);

        logger.error(`DB remove - ${DOC_TYPE} -`, error.message);
        throw db.handleError(error);
    }
}

export {findByID, find, insert, update, remove};

// curl -v http://localhost:8093/query/service -d "statement=SELECT * FROM \`employee-scheduling\`"
// curl -v http://192.168.33.10:8093/query/service -d "statement=SELECT * FROM default WHERE type = 'partner'"
// curl -v http://localhost:8093/query?statement=SELECT+*+FROM+default
// curl -v http://192.168.33.10:8093/query/service -d "statement=SELECT COUNT(*) FROM system:indexes WHERE state='online'"

// curl -v http://localhost:8093/query/service -d "statement=CREATE PRIMARY INDEX ON \`employee-scheduling\` USING GSI"

//http://pouchdb.com/2015/03/05/taming-the-async-beast-with-es7.html
// https://github.com/couchbaselabs/gameapi-nodejs/blob/master/models%2Faccountmodel.js !!
// https://gist.github.com/martinesmann/6eb50d033436decdfe3c#file-n1ql_samples-sql
