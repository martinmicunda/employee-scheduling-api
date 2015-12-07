/**
 * The availabilityDAO module that provides an abstract interface to database
 * with create and read operations.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import uuid from 'node-uuid';
//import mmLogger from 'mm-node-logger';
import db from '../../../config/couchbase';

//const logger = mmLogger(module);
const DOC_TYPE = 'availability';

/**
 * Retrieves list of availabilities by employee ID from DB.
 *
 * @param {String} employeeId - The employee id
 * @param {String} startDate - The query start date range
 * @param {String} endDate - The query end date range
 * @returns {Array.<Object>} the array that contains list of availabilities
 * @throws {Error} Will throw an error if it failed to retrieve a availabilities from DB.
 * @api public
 */
async function findByEmployeeId(employeeId, startDate, endDate) {
    const query = db.N1qlQuery.fromString(`SELECT META().id as id, LTRIM(META().id,'${employeeId}::') as date, '${employeeId}' as employeeId, \`${db.bucketName}\`.* FROM \`${db.bucketName}\` WHERE type = '${DOC_TYPE}' AND META().id BETWEEN '${employeeId}::${startDate}' AND '${employeeId}::${endDate}'`);

    try {
        return await db.query(query);
    } catch(error) {
        console.error(`DB findByEmployeeId - ${DOC_TYPE} -`, error.message);
        //logger.error(`DB findByEmployeeId - ${DOC_TYPE} -`, error.message);

        throw db.handleError(error);
    }
}

/**
 * Retrieves list of availabilities from DB.
 *
 * @param {String} startDate - The query start date range
 * @param {String} endDate - The query end date range
 * @returns {Array.<Object>} the array that contains list of availabilities
 * @throws {Error} Will throw an error if it failed to retrieve a availabilities from DB.
 * @api public
 */
async function find(startDate, endDate) {
    const query = db.N1qlQuery.fromString(`SELECT META().id as id, SPLIT(META().id,'::')[1] as date, SPLIT(META().id,'::')[0] as employeeId, \`${db.bucketName}\`.* FROM \`${db.bucketName}\` WHERE type = '${DOC_TYPE}' AND SPLIT(META().id,'::')[1] BETWEEN '${startDate}' AND '${endDate}'`);

    try {
        return await db.query(query);
    } catch(error) {
        console.error(`DB find - ${DOC_TYPE} -`, error.message);
        //logger.error(`DB find - ${DOC_TYPE} -`, error.message);

        throw db.handleError(error);
    }
}

/**
 * Creates a availability document in DB.
 *
 * @param {Object} doc - The availability document
 * @param {String} doc.date - The availability date in format `YYYYMMDD`
 * @param {String} doc.availability - The availability name ('available', 'unavailable', 'necessary')
 * @param {String} doc.employeeId - The employee id
 * @param {String} doc.note - The availability note
 * @param {String} [id=uuid] - The availability id
 * @throws {Error} Will throw an error if it failed to create a availability document in DB.
 * @api public
 */
async function insert(doc, id = uuid.v1()) {
    doc.type = DOC_TYPE;

    try {
        await db.upsert(id, doc);
    } catch(error) {
        console.error(`DB insert - ${DOC_TYPE} -`, error.message);
        //logger.error(`DB insert - ${DOC_TYPE} -`, error.message);
        throw db.handleError(error);
    }
}

export {findByEmployeeId, find, insert};
