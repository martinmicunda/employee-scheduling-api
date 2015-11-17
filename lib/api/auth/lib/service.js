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
import generatePassword from 'password-generator';
import * as dao from '../../employees/lib/dao';
import config from '../../../config/config';

function hashPassword(salt, password) {
    return crypto.pbkdf2Sync(password, new Buffer(salt, 'base64'), 10000, 64).toString('base64');
}

async function create(doc) {
    const salt = crypto.randomBytes(16).toString('base64');
    const password = generatePassword(12, false);

    doc.salt = salt;
    doc.password = hashPassword(salt, 'password');

    try {
        //const data =  await dao.insert(doc);
        const data = {d: 'ok'};


        return data;
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

        // TODO: store only id in token and add additional information role, name, avatar into respond and front end should store this details into localcelstorage
        return {token};
    } catch(error) {
        if(error.isBoom && error.output.statusCode === 404) {
            throw Boom.unauthorized('Wrong email or password.');
        }

        throw error;
    }
}

export {create, authenticate};

