/**
 * EmployeeService module mediate the communication between requests and data manipulation.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import config from '../../../config/config';
import * as tokenDAO from '../../auth/lib/dao';
import * as employeeDAO from './dao';
import * as emailService from '../../emails/lib/service';

async function create(doc) {
    const employee = await employeeDAO.insert(doc);
    const tokenId = await tokenDAO.insert(employee.id, doc.email);

    try {
        await emailService.sendAccountActivationEmail(doc, tokenId);
    } catch(error) { // do a rollback and remove new created employee and token
        employeeDAO.remove(employee.id);
        tokenDAO.remove(tokenId);

        throw error;
    }

    return employee;
}

// TODO: below functions should be remove and replaced with N1QL queries
async function findAccountDetails(id) {
    const data = await employeeDAO.findByID(id);
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
    const doc = await employeeDAO.findByID(id);

    return await employeeDAO.update(id, Object.assign(doc, partialDoc));
}

export {findAccountDetails, updateAccountDetails, create};

