/**
 * AuthService module that contains auth business logic.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import jwt from 'koa-jwt';
import Boom from 'boom';
import crypto from 'crypto';
import i18n from '../../../config/i18n';
import config from '../../../config/config';
import * as tokenDAO from './dao';
import * as employeeDAO from '../../employees/lib/dao';
import * as emailService from '../../emails/lib/service';

function hashPassword(salt, password) {
    return crypto.pbkdf2Sync(password, new Buffer(salt, 'base64'), 10000, 64).toString('base64');
}

async function authenticate(email, password) {
    try {
        const employee = await employeeDAO.findByEmail(email);

        if(employee.status !== 'active' || employee.password !== hashPassword(employee.salt, password)) {
            throw Boom.unauthorized('Wrong email or password.');
        }

        const profile = {id: employee.id, firstName: employee.firstName, lastName: employee.lastName, role: employee.role, avatar: employee.avatar};
        /**
         * Token is divided in 3 parts:
         *  - header
         *  - payload (It contains some additional information that
         *  we can pass with token e.g. {user: 2, admin: true}. This
         *  gets encoded into base64.)
         *  - signature
         *
         * Token is something like xxxxxxxxxxx.yyyy.zzzzzzzzzzzz. Where the x is
         * the encoded header, the y is the encoded payload and
         * the z is the signature. So on front-end we can decode
         * the yyyy part (the payload) if we need.
         */
        const token = jwt.sign(profile, config.token.secret, { expiresInMinutes: config.token.expiration });

        return {token};
    } catch(error) {
        if(error.isBoom && error.output.statusCode === 404) {
            throw Boom.unauthorized('Wrong email or password.');
        }

        throw error;
    }
}

async function reset(password, tokenId) {
    let tokenDoc;

    // first check if token exist or hasn't expiry
    try {
        tokenDoc = await tokenDAO.findByID(tokenId);
    } catch(error) {
        if(error.isBoom && error.output.statusCode === 404) {
            throw Boom.badRequest(i18n.__('ERROR_ACCOUNT_ACTIVATION'));
        }

        throw error;
    }

    // then update employee password
    const salt = crypto.randomBytes(16).toString('base64');
    const passwordHashed = hashPassword(salt, password);

    await employeeDAO.updatePassword(tokenDoc.employeeId, passwordHashed, salt);
    await tokenDAO.remove(tokenId);

    return await authenticate(tokenDoc.employeeEmail, password);
}

async function forgot(email) {
    // first check if employee exists and is active employee
    const employee = await employeeDAO.findByEmail(email);
    if(employee.status !== 'active') {
        throw Boom.badRequest(i18n.__('ERROR_ACCOUNT_NOT_ACTIVATED'));
    }
    const tokenId = await tokenDAO.insert(employee.id, employee.email);

    // then send password reset email to employee
    try {
        return await emailService.sendPasswordResetEmail(employee, tokenId)
    } catch(error) { // do a rollback and remove new created token
        tokenDAO.remove(tokenId);
        throw error;
    }
}

async function update(credentials, id) {
    const employee = await employeeDAO.findByID(id);
    if(employee.password !== hashPassword(employee.salt, credentials.currentPassword)) {
        throw Boom.badRequest(i18n.__('ERROR_CURRENT_PASSWORD'));
    }

    const salt = crypto.randomBytes(16).toString('base64');
    const passwordHashed = hashPassword(salt, credentials.password);

    await employeeDAO.updatePassword(employee.id, passwordHashed, salt);
}

export {authenticate, reset, forgot, update};

