/**
 * EmployeeService module mediate the communication between requests and data manipulation.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Boom from 'boom';
import crypto from 'crypto';
import generatePassword from 'password-generator';
import * as dao from './dao';

function hashPassword(salt, password) {
    return crypto.pbkdf2Sync(password, new Buffer(salt, 'base64'), 10000, 64).toString('base64');
}

async function create(doc) {
    const salt = crypto.randomBytes(16).toString('base64');
    const password = generatePassword(12, false);

    doc.salt = salt;
    doc.password = hashPassword(salt, 'password');

    try {
        return await dao.insert(doc);
    } catch(error) {
        throw error;
    }
}

async function authenticate(email, password) {
    try {
        const employee = await dao.findByEmail(email);

        if(employee.status !== 'active' || employee.password !== hashPassword(employee.salt, password)) {
            throw Boom.unauthorized('Wrong email or password.');
        }

        return {id: employee.id, firstName: employee.firstName, lastName: employee.lastName, role: employee.role, avatar: employee.avatar};
    } catch(error) {
        if(error.isBoom && error.output.statusCode === 404) {
            throw Boom.unauthorized('Wrong email or password.');
        }

        throw error;
    }
}

async function me(id) {
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

export {me, create, authenticate};

