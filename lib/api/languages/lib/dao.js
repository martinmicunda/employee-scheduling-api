/**
 * The languageDAO module that provides an abstract interface to database
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
const DOC_TYPE = 'language';

/**
 * Retrieves a language by ID from DB.
 *
 * @param {String} id - The language id
 * @returns {Object} the language
 * @throws {Error} Will throw an error if it failed to retrieve a language from DB.
 * @api public
 */
async function findByID(id) {
    //const query = db.N1qlQuery.fromString(`SELECT META().cas, META().id, \`${db.bucketName}\`.* FROM \`${db.bucketName}\` USE KEYS "${id}"`);
    //const data = await db.query(query);
    try {
        const data = await db.get(id);

        return Object.assign({id: id, cas: data.cas}, data.value);
    } catch(error) {
        logger.error(`DB findByID - ${DOC_TYPE} -`, error.message);
        throw db.handleError(error);
    }
}

/**
 * Retrieves list of languages from DB.
 *
 * @returns {Array.<Object>} the array that contains list of languages
 * @throws {Error} Will throw an error if it failed to retrieve a languages from DB.
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
 * Creates a language document in DB.
 *
 * @param {Object} doc - The language document
 * @param {String} doc.code - The language ISO code
 * @param {String} doc.name - The language name
 * @param {String} [id=uuid] - The language id
 * @throws {Error} Will throw an error if it failed to create a language document in DB.
 * @api public
 */
async function insert(doc, id = uuid.v1()) {
    doc.type = DOC_TYPE;
    //const query = db.N1qlQuery.fromString(`INSERT INTO \`${db.bucketName}\` (KEY, VALUE) VALUES ($1, $2) RETURNING \`${db.bucketName}\`.*`);

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
 * Updates a language document in DB.
 *
 * @param {String} id - The language id
 * @param {Object} doc - The language document
 * @param {String} doc.id - The language id
 * @param {String} doc.cas - The couchbase cas value
 * @param {String} doc.code - The language ISO code
 * @param {String} doc.name - The language name
 * @throws {Error} Will throw an error if it failed to update a language document in DB.
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
 * Removes a language document from DB.
 *
 * @param {String} id - The language id
 * @throws {Error} Will throw an error if it failed to remove a language document from DB.
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
// http://www.slideshare.net/Couchbase/enterprise-architects-perspective-of-couchbase-with-n1-ql
// http://www.slideshare.net/Couchbase/migrations-rdbms-couchbasefinal-49133236
// http://developer.couchbase.com/documentation/server/4.0/n1ql/n1ql-language-reference/index.html
// https://gist.github.com/martinesmann/6eb50d033436decdfe3c#file-n1ql_samples-sql
// http://blog.couchbase.com/sql-for-documents-n1ql-brief-introduction-to-query-planning
