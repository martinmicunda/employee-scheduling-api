/**
 * The positionDAO module that provides an abstract interface to database
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
const DOC_TYPE = 'position';
const REF_DOC_TYPE = `${DOC_TYPE}::name`;

/**
 * Generate reference document compound id.
 *
 * @param {Object} doc - The position document
 * @param {String} doc.name - The position name
 * @returns {String} the reference document compound id
 * @api private
 */
function generateRefDocId(doc) {
    return `${DOC_TYPE}::${doc.name.replace(/ /g,'').toLowerCase()}`
}

/**
 * Retrieves a position by ID from DB.
 *
 * @param {String} id - The position id
 * @returns {Object} the position
 * @throws {Error} Will throw an error if it failed to retrieve a position from DB.
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
 * Retrieves list of positions from DB.
 *
 * @returns {Array.<Object>} the array that contains list of positions
 * @throws {Error} Will throw an error if it failed to retrieve a positions from DB.
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
 * Creates a position reference document in DB to lookup position 'name' and prevent duplicates.
 *
 * @param {Object} doc - The position document
 * @param {String} doc.name - The position name
 * @param {String} refId - The referential document id
 * @throws {Error} Will throw an error if it failed to create a position ref document in DB.
 * @api private
 */
async function insertRefDoc(doc, refId) {
    const refDocId = generateRefDocId(doc);
    const refDoc = {
        positionId: refId
    };

    try {
        await db.insert(refDocId, refDoc, db.durabilityOptions);
    } catch(error) {
        logger.error(`DB insert - ${REF_DOC_TYPE} -`, `${error.message}`);

        throw db.handleError(error);
    }
}

/**
 * Creates a position document in DB.
 *
 * @param {Object} doc - The position document
 * @param {String} doc.name - The position name
 * @param {String} [id=uuid] - The position id
 * @throws {Error} Will throw an error if it failed to create a position document in DB.
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
}

/**
 * Updates a position document in DB.
 *
 * @param {Object} doc - The position document
 * @param {String} doc.id - The position id
 * @param {String} doc.name - The position name
 * @param {String} doc.cas - The couchbase cas value
 * @throws {Error} Will throw an error if it failed to update a position document in DB.
 * @api public
 */
async function update(doc) {
    const {id, cas} = doc;
    // do not store CAS(version) and document ID as Couchbase already keep these values in metadata for each document
    doc = db.removeMetadataFromDoc(doc);
    doc.type = DOC_TYPE; // map-reduces

    const docOld = await findByID(id);
    // check if unique value has changed
    if(docOld.name !== doc.name) {
        let casNew;
        // 1. insert new ref doc first
        await insertRefDoc(doc, id);
        // 2. update doc
        try {
            casNew = await db.replace(id, doc, {cas: cas});
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
                await db.replace(id, docOld, {cas: casNew});
            } catch(error) {
                logger.error(`DB update - ${DOC_TYPE} -`, error.message);
                throw db.handleError(error);
            }
        }

        return {cas};
    }

    try {
        return await db.replace(id, doc, {cas: cas});
    } catch(error) {
        logger.error(`DB update - ${DOC_TYPE} -`, error.message);

        throw db.handleError(error);
    }
}

/**
 * Removes a position reference document from DB to lookup position 'name' and prevent duplicates.
 *
 * @param {Object} doc - The position document
 * @param {String} doc.name - The position name
 * @throws {Error} Will throw an error if it failed to remove a position ref document from DB.
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
 * Removes a position document from DB.
 *
 * @param {String} id - The position id
 * @throws {Error} Will throw an error if it failed to remove a position document from DB.
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
