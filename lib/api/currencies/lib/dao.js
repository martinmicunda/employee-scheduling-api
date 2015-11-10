/**
 * The currencyDAO module that provides an abstract interface to database
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
const DOC_TYPE = 'currency';

/**
 * Retrieves a currency by ID from DB.
 *
 * @param {String} id - The currency id
 * @returns {Object} the currency
 * @throws {Error} Will throw an error if it failed to retrieve a currency from DB.
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
 * Retrieves list of currencys from DB.
 *
 * @returns {Array.<Object>} the array that contains list of currencys
 * @throws {Error} Will throw an error if it failed to retrieve a currencys from DB.
 * @api public
 */
async function find() {
    const query = db.N1qlQuery.fromString(`SELECT meta().cas, meta().id, \`${db.bucketName}\`.* FROM \`${db.bucketName}\` WHERE type = '${DOC_TYPE}'`);

    try {
        return await db.query(query);
    } catch(error) {
        logger.error(`DB find - ${DOC_TYPE} -`, error.message);

        throw db.handleError(error);
    }
}

/**
 * Creates a currency document in DB.
 *
 * @param {Object} doc - The currency document
 * @param {String} doc.code - The currency ISO code
 * @param {String} doc.symbol - The currency ISO symbol
 * @param {String} [id=uuid] - The currency id
 * @throws {Error} Will throw an error if it failed to create a currency document in DB.
 * @api public
 */
async function insert(doc, id = uuid.v1()) {
    doc.type = DOC_TYPE;

    try {
        const data = await db.insert(id, doc, db.durabilityOptions);
        data.id = id;

        return data;
    } catch(error) {
        logger.error(`DB insert - ${DOC_TYPE} -`, error.message);
        throw db.handleError(error);
    }
}

/**
 * Updates a currency document in DB.
 *
 * @param {String} id - The currency id
 * @param {Object} doc - The currency document
 * @param {String} doc.id - The currency id
 * @param {String} doc.cas - The couchbase cas value
 * @param {String} doc.code - The currency ISO code
 * @param {String} doc.symbol - The currency ISO symbol
 * @throws {Error} Will throw an error if it failed to update a currency document in DB.
 * @api public
 */
async function update(id, doc) {
    const cas = doc.cas;
    // do not store CAS(version) and document ID as Couchbase already keep these values in metadata for each document
    doc = db.removeMetadataFromDoc(doc);
    doc.type = DOC_TYPE; // map-reduces

    try {
        return await db.replace(id, doc, {cas: cas});
    } catch(error) {
        logger.error(`DB update - ${DOC_TYPE} -`, error.message);

        throw db.handleError(error);
    }
}

/**
 * Removes a currency document from DB.
 *
 * @param {String} id - The currency id
 * @throws {Error} Will throw an error if it failed to remove a currency document from DB.
 * @api public
 */
async function remove(id) {
    try {
        await db.remove(id);
    } catch(error) {
        logger.error(`DB remove - ${DOC_TYPE} -`, error.message);
        throw db.handleError(error);
    }
}

export {findByID, find, insert, update, remove};
