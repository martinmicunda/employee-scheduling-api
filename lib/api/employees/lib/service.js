/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Boom from 'boom';
import crypto from 'crypto';
import generatePassword from 'password-generator';
import * as employeeDAO from './dao';

function hashPassword(salt, password) {
    return crypto.pbkdf2Sync(password, new Buffer(salt, 'base64'), 10000, 64).toString('base64');
}

async function create(doc) {
    const salt = crypto.randomBytes(16).toString('base64');
    const password = generatePassword(12, false);

    doc.salt = salt;
    doc.password = hashPassword(salt, password);

    try {
        return await employeeDAO.insert(doc);
    } catch(error) {
        throw error;
    }
}

async function authenticate(email, password) {
    try {
        const employee = await employeeDAO.findByEmail(email);

        if(employee.status !== 'active' || employee.password !== hashPassword(employee.salt, password)) {
            throw Boom.unauthorized('Wrong email or password.');
        }

        return {id: employee.id, name: employee.firstName + ' ' + employee.lastName, role: employee.role, avatar: employee.avatar};
    } catch(error) {
        if(error.isBoom && error.output.statusCode === 404) {
            throw Boom.unauthorized('Wrong email or password.');
        }

        throw error;
    }
}

export {create, authenticate};

