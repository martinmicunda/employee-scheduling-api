/**
 * EmployeeService module mediate the communication between requests and data manipulation.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import * as dao from './dao';
import config from '../../../config/config';

// TODO: below functions should be remove and replaced with N1QL queries
async function findAccountDetails(id) {
    const data = await dao.findByID(id);
    const profile = {};
    const fieldNamesArray = ['id', 'cas', 'avatar', 'firstName', 'lastName', 'email', 'note', 'phoneNumber', 'address', 'city',  'zipCode'];

    for (let prop of fieldNamesArray) {
        if (data.hasOwnProperty(prop)) {
            profile[prop] = data[prop];
        }
    }

    return profile;
}

async function updateAccountDetails(id, partialDoc) {
    const doc = await dao.findByID(id);

    return await dao.update(id, Object.assign(doc, partialDoc));
}

export {findAccountDetails, updateAccountDetails};

