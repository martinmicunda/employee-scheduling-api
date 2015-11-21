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
const REF_DOC_TYPE = `${DOC_TYPE}::email`;

/**
 * Generate reference document compound id.
 *
 * @param {Object} doc - The employee document
 * @param {String} doc.email - The employee email
 * @returns {String} the reference document compound id
 * @api private
 */
function generateRefDocId(doc) {
    return `${DOC_TYPE}::${doc.email.replace(/ /g,'').toLowerCase()}`
}

/**
 * Retrieves an employee by email from DB.
 *
 * @param {String} email - The employee email
 * @returns {Object} the employee
 * @throws {Error} Will throw an error if it failed to retrieve an employee from DB.
 * @api public
 */
async function findByEmail(email) {
    const doc = {email: email};

    try {
        const redDoc = await db.get(generateRefDocId(doc));
        const data = await db.get(redDoc.value.refId);
        data.value.id = redDoc.value.refId;

        return data.value;
    } catch(error) {
        logger.error(`DB findByEmail - ${DOC_TYPE} -`, error.message);
        throw db.handleError(error);
    }
}

/**
 * Retrieves an employee by ID from DB.
 *
 * @param {String} id - The employee id
 * @returns {Object} the employee
 * @throws {Error} Will throw an error if it failed to retrieve an employee from DB.
 * @api public
 */
async function findByID(id) {
    try {
        const data = await db.get(id);
        // for security measurement we remove the salt and password
        //delete data.value.salt; TODO: salt and password are required when user try update password
        //delete data.value.password;

        return Object.assign({id: id, cas: data.cas}, data.value);
    } catch(error) {
        logger.error(`DB findByID - ${DOC_TYPE} -`, error.message);
        throw db.handleError(error);
    }
}

/**
 * Retrieves list of employees from DB.
 *
 * @param {Object} query - The query object
 * @param {String} query.fields - The query with limiting fields to return
 * @returns {Array.<Object>} the array that contains list of employees
 * @throws {Error} Will throw an error if it failed to retrieve an employees from DB.
 * @api public
 */
async function find(query) {
    const sql = db.N1qlQuery.fromString(`SELECT meta().id, ${db.escapeQuery(query.fields)} FROM \`${db.bucketName}\` WHERE type = '${DOC_TYPE}' ORDER BY firstName`);

    try {
        return await db.query(sql);
    } catch(error) {
        logger.error(`DB find - ${DOC_TYPE} -`, error.message);

        throw db.handleError(error);
    }
}

/**
 * Creates an employee reference document in DB to lookup employee 'email' and prevent duplicates.
 *
 * @param {Object} doc - The employee document
 * @param {String} doc.email - The employee email
 * @param {String} refId - The referential document id
 * @throws {Error} Will throw an error if it failed to create an employee ref document in DB.
 * @api private
 */
async function insertRefDoc(doc, refId) {
    const refDocId = generateRefDocId(doc);
    const refDoc = {
        refId: refId
    };

    try {
        await db.insert(refDocId, refDoc, db.durabilityOptions);
    } catch(error) {
        logger.error(`DB insert - ${REF_DOC_TYPE} -`, `${error.message}`);

        throw db.handleError(error);
    }
}

/**
 * Creates an employee document in DB.
 *
 * @param {Object} doc - The employee document
 * @param {String} doc.firstName - The employee first name
 * @param {String} doc.lastName - The employee last name
 * @param {String} doc.avatar - The employee avatar
 * @param {String} doc.email - The employee email
 * @param {String} doc.language - The employee language
 * @param {String} doc.position - The employee position
 * @param {String} doc.role - The employee role
 * @param {String} doc.status - The employee status*
 * @param {String} doc.phoneNumber - The employee phone number
 * @param {String} doc.address - The employee address
 * @param {String} doc.city - The employee city
 * @param {String} doc.zipCode - The employee zipCode
 * @param {String} doc.bankName - The employee bank name
 * @param {String} doc.bankAccountName - The employee bank account name
 * @param {String} doc.bankAccountNumber - The employee bank account number
 * @param {Number} doc.hourlyRate - The employee hourly rate
 * @param {String} doc.currencyCode - The employee currency code
 * @param {String} doc.currencySymbol - The employee currency symbol
 * @param {Array.<String>} doc.locations - The employee locations
 * @param {Array.<String>} doc.supervisorLocations - The employee supervisor locations
 * @param {String} doc.personalNo - The employee personal number
 * @param {String} doc.identityNo - The employee identity number
 * @param {String} doc.note - The employee note
 * @param {String} doc.password - The employee password
 * @param {String} doc.salt - The employee salt
 * @param {String} doc.createdAt - The ISO-8601 date when the employee was created
 * @param {String} [id=uuid] - The employee id
 * @throws {Error} Will throw an error if it failed to create an employee document in DB.
 * @api public
 */
async function insert(doc, id = uuid.v1()) {
    doc.type = DOC_TYPE; // map-reduces
    doc.createdAt = new Date().toISOString();

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
 * Updates an employee document in DB.
 *
 * @param {String} id - The employee id
 * @param {Object} doc - The employee document
 * @param {String} doc.id - The employee id
 * @param {String} doc.firstName - The employee first name
 * @param {String} doc.lastName - The employee last name
 * @param {String} doc.avatar - The employee avatar
 * @param {String} doc.email - The employee email
 * @param {String} doc.language - The employee language
 * @param {String} doc.position - The employee position
 * @param {String} doc.role - The employee role
 * @param {String} doc.status - The employee status*
 * @param {String} doc.phoneNumber - The employee phone number
 * @param {String} doc.address - The employee address
 * @param {String} doc.city - The employee city
 * @param {String} doc.zipCode - The employee zipCode
 * @param {String} doc.bankName - The employee bank name
 * @param {String} doc.bankAccountName - The employee bank account name
 * @param {String} doc.bankAccountNumber - The employee bank account number
 * @param {Number} doc.hourlyRate - The employee hourly rate
 * @param {String} doc.currencyCode - The employee currency code
 * @param {String} doc.currencySymbol - The employee currency symbol
 * @param {Array.<String>} doc.locations - The employee locations
 * @param {Array.<String>} doc.supervisorLocations - The employee supervisor locations
 * @param {String} doc.personalNo - The employee personal number
 * @param {String} doc.identityNo - The employee identity number
 * @param {String} doc.note - The employee note
 * @param {String} doc.password - The employee password
 * @param {String} doc.salt - The employee salt
 * @param {String} doc.cas - The couchbase cas value
 * @param {String} doc.createdAt - The ISO-8601 date when the employee was created
 * @param {String} doc.updatedAt - The ISO-8601 date when the employee was last updated (modified)
 * @throws {Error} Will throw an error if it failed to update an employee document in DB.
 * @api public
 */
async function update(id, doc) {
    let cas = doc.cas;
    // do not store CAS(version) and document ID as Couchbase already keep these values in metadata for each document
    doc = db.removeMetadataFromDoc(doc);
    doc.type = DOC_TYPE; // map-reduces
    doc.updatedAt = new Date().toISOString();

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
 * Updates an employee password in DB.
 *
 * @param {String} id - The employee id
 * @param {String} password - The employee password
 * @param {String} salt - The employee salt
 * @throws {Error} Will throw an error if it failed to update an employee password in DB.
 * @api public
 */
async function updatePassword(id, password, salt) {
    const sql = db.N1qlQuery.fromString(`UPDATE \`${db.bucketName}\` USE KEYS "${id}" SET \`password\`="${password}", salt="${salt}", status="active", updatedAt="${new Date().toISOString()}"`);

    try {
        return await db.query(sql);
    } catch(error) {
        logger.error(`DB updatePassword - ${DOC_TYPE} -`, error.message);

        throw db.handleError(error);
    }
}

/**
 * Removes an employee reference document from DB to lookup employee 'email' and prevent duplicates.
 *
 * @param {Object} doc - The employee document
 * @param {String} doc.email - The employee email
 * @throws {Error} Will throw an error if it failed to remove an employee ref document from DB.
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
 * Removes an employee document from DB.
 *
 * @param {String} id - The employee id
 * @throws {Error} Will throw an error if it failed to remove an employee document from DB.
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

export {findByEmail, findByID, find, insert, update, updatePassword, remove};

