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

/**
 * Generate document compound id.
 *
 * @param {String} id - The partner id
 * @returns {String} the document compound id
 * @api private
 */
function generateDocId(id) {
    return `${DOC_TYPE}::${id}`;
}

/**
 * Generate reference document compound id.
 *
 * @param {Object} doc - The partner document
 * @param {String} doc.name - The partner name
 * @returns {String} the reference document compound id
 * @api private
 */
function generateRefDocId(doc) {
    return `${DOC_TYPE}::name::${doc.name.replace(/ /g,'').toLowerCase()}`
}

/**
 * Generate reference document.
 *
 * @param {Object} doc - The partner document
 * @param {String} doc.id - The partner id
 * @returns {Object} the reference document
 * @api private
 */
function generateRefDoc(doc) {
    return {
        type: `${DOC_TYPE}::name`,
        partnerId: doc.id
    };
}

/**
 * Retrieves a partner by ID from DB.
 *
 * @param {String} id - The partner id
 * @returns {Object} the partner
 * @throws {DbError} Will throw an error if it failed to retrieve a partner from DB.
 * @api public
 */
async function findByID(id) {
    //const query = db.N1qlQuery.fromString(`SELECT META().cas, default.* FROM default WHERE META(default).id = "${generateDocId(id)}"`);

    try {
        const data = await db.get(generateDocId(id));
        data.value.cas = data.cas;

        return data.value;
        //return await db.query(query);
    } catch(error) {
        logger.error(`DB findByID - ${DOC_TYPE} -`, error.message);
        throw db.handleError(error);
    }
}

/**
 * Retrieves list of partners from DB.
 *
 * @returns {Array.<Object>} the array that contains list of partners
 * @throws {DbError} Will throw an error if it failed to retrieve a partners from DB.
 * @api public
 */
async function find() {
    const query = db.N1qlQuery.fromString(`SELECT META().cas, \`${db.bucketName}\`.* FROM \`${db.bucketName}\` WHERE type = "${DOC_TYPE}" ORDER BY name`);

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
 * @param {String} doc.id - The partner id
 * @param {String} doc.name - The partner name
 * @throws {DbError} Will throw an error if it failed to create a partner ref document in DB.
 * @api private
 */
async function insertRefDoc(doc) {
    // referential document to lookup partner 'name' and prevent duplicates
    const refDocId = generateRefDocId(doc);
    const refDoc = generateRefDoc(doc);

    try {
        await db.insert(refDocId, refDoc, {persist_to: 1, replicate_to: 1});
    } catch(error) {
        logger.error(`DB insert - ${refDoc.type} -`, `${error.message}`);

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
 * @throws {DbError} Will throw an error if it failed to create a partner document in DB.
 * @api public
 * @see #insertRefDoc
 */
async function insert(doc) {
    // TODO: should I store id into doc as it already store in metadata
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
        const data = await db.insert(generateDocId(doc.id), doc, {persist_to: 1, replicate_to: 1});
        data.id = doc.id;

        return data;
    } catch(error) {
        // do a rollback and remove referential document
        try {
            await removeRefDoc(doc);
            logger.error(`DB insert - ${DOC_TYPE} -`, error.message);

            throw db.handleError(error);
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

/**
 * Updates a partner document in DB.
 *
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
 * @throws {DbError} Will throw an error if it failed to create a partner document in DB.
 * @api public
 * @see #insertRefDoc
 */
async function update(doc) {
    const cas = doc.cas;
    doc.type = DOC_TYPE; // map-reduces
    // do not store CAS(version) as Couchbase already keep this in key metadata for each document
    delete doc.cas;

    try {
        // TODO: this step is wrong I should look findByName which should be quicker as document is smaller and if it return 409 I know name already exist
        const docOld = await findByID(doc.id);
        if(docOld.name !== doc.name) {
            // TODO: add steps when unique value is changed
            // 1. create new ref doc
            // 2. update doc
            // 3. delete old ref doc
        }

        return await db.replace(generateDocId(doc.id), doc, {cas: cas});
    } catch(error) {
        logger.error(`DB update - ${DOC_TYPE} -`, error.message);

        throw db.handleError(error);
    }
}

/**
 * Removes a partner reference document from DB to lookup partner 'name' and prevent duplicates.
 *
 * @param {Object} doc - The partner document
 * @param {String} doc.id - The partner id
 * @param {String} doc.name - The partner name
 * @throws {DbError} Will throw an error if it failed to remove a partner ref document from DB.
 * @api private
 */
async function removeRefDoc(doc) {
    const refDocId = generateRefDocId(doc);
    const refDoc = generateRefDoc(doc);

    try {
        await db.remove(refDocId);
    } catch(error) {
        logger.error(`DB remove - ${refDoc.type} -`, `${error.message}`);

        throw db.handleError(error);
    }
}

/**
 * Removes a partner document from DB.
 *
 * @param {String} id - The partner id
 * @throws {DbError} Will throw an error if it failed to remove a partner document from DB.
 * @api public
 * @see #removeRefDoc
 */
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
        await db.remove(generateDocId(doc.id));
    } catch(error) {
        // do a rollback and insert referential document
        try {
            await insertRefDoc(doc);
            logger.error(`DB remove - ${DOC_TYPE} -`, error.message);

            throw db.handleError(error);
        } catch(error) {
            throw error;
        }
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
