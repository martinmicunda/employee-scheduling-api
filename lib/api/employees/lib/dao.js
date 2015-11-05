/**
 * The employeeDAO module that provides an abstract interface to database
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
const DOC_TYPE = 'employee';

/**
 * Generate document compound id.
 *
 * @param {String} id - The employee id
 * @returns {String} the document compound id
 * @api private
 */
function generateDocId(id) {
    return `${DOC_TYPE}::${id}`;
}

/**
 * Generate reference document compound id.
 *
 * @param {Object} doc - The employee document
 * @param {String} doc.email - The employee name
 * @returns {String} the reference document compound id
 * @api private
 */
function generateRefDocId(doc) {
    return `${DOC_TYPE}::email::${doc.email.replace(/ /g,'').toLowerCase()}`
}

/**
 * Generate reference document.
 *
 * @param {Object} doc - The employee document
 * @param {String} doc.id - The employee id
 * @returns {Object} the reference document
 * @api private
 */
function generateRefDoc(doc) {
    return {
        type: `${DOC_TYPE}::email`,
        employeeId: doc.id
    };
}

/**
 * Retrieves a employee by email from DB.
 *
 * @param {String} email - The employee email
 * @returns {Object} the employee
 * @throws {Error} Will throw an error if it failed to retrieve a employee from DB.
 * @api public
 */
async function findByEmail(email) {
    const doc = {email: email};

    try {
        const redDoc = await db.get(generateRefDocId(doc));
        const data = await db.get(generateDocId(redDoc.value.employeeId));

        return data.value;
    } catch(error) {
        logger.error(`DB findByEmail - ${DOC_TYPE} -`, error.message);
        throw db.handleError(error);
    }
}

/**
 * Creates a employee reference document in DB to lookup employee 'email' and prevent duplicates.
 *
 * @param {Object} doc - The employee document
 * @param {String} doc.id - The employee id
 * @param {String} doc.email - The employee email
 * @throws {Error} Will throw an error if it failed to create a employee ref document in DB.
 * @api private
 */
async function insertRefDoc(doc) {
    // referential document to lookup partner 'email' and prevent duplicates
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
 * Creates a employee document in DB.
 *
 * @param {Object} doc - The partner document
 * @param {String} doc.name - The partner name
 * @param {String} doc.contactPerson - The partner contact person
 * @param {String} doc.email - The partner email
 * @param {String} doc.phoneNumber - The partner phone number
 * @param {String} doc.color - The partner color
 * @param {String} doc.status - The partner status
 * @param {String} doc.note - The partner note
 * @throws {Error} Will throw an error if it failed to create a partner document in DB.
 * @api public
 * @see #insertRefDoc
 */
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
}

/**
 * Removes a employee reference document from DB to lookup employee 'email' and prevent duplicates.
 *
 * @param {Object} doc - The employee document
 * @param {String} doc.id - The employee id
 * @param {String} doc.name - The employee email
 * @throws {Error} Will throw an error if it failed to remove a employee ref document from DB.
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

export {insert, findByEmail};

//export {findByID, find, insert, update, remove};

