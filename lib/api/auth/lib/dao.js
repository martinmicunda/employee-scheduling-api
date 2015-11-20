/**
 * The tokenDAO module that provides an abstract interface to database
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

//const logger = mmLogger(module);
const DOC_TYPE = 'token';

/**
 * Retrieves a token by ID from DB.
 *
 * @param {String} id - The token id
 * @returns {Object} the token
 * @throws {Error} Will throw an error if it failed to retrieve a token from DB.
 * @api public
 */
async function findByID(id) {
    try {
        const data = await db.get(id);

        return data.value;
    } catch(error) {
        //logger.error(`DB findByID - ${DOC_TYPE} -`, error.message);
        throw db.handleError(error);
    }
}

/**
 * Creates a token document in DB.
 *
 * @param {String} employeeId - The employee id
 * @param {String} employeeEmail - The employee email
 * @param {String} [token=uuid] - The unique token
 * @param {Number} [expiry=86400] - The document expiration (default 1 day)
 * @throws {Error} Will throw an error if it failed to create a token document in DB.
 * @api public
 */
async function insert(employeeId, employeeEmail, token = uuid.v1(), expiry = 86400) {
    const doc = {
        type: DOC_TYPE, // map-reduces
        employeeId: employeeId,
        employeeEmail: employeeEmail,
        expiry: expiry
    };

    try {
        await db.insert(token, doc, {expiry: doc.expiry});

        return token;
    } catch(error) {
        //logger.error(`DB insert - ${DOC_TYPE} -`, error.message);
        throw db.handleError(error);
    }
}

/**
 * Removes a token document from DB.
 *
 * @param {String} id - The token id
 * @throws {Error} Will throw an error if it failed to remove a token document from DB.
 * @api public
 */
async function remove(id) {
    try {
        await db.remove(id);
    } catch(error) {
        //logger.error(`DB remove - ${DOC_TYPE} -`, error.message);
        throw db.handleError(error);
    }
}

export {findByID, insert, remove};
