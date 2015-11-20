/**
 * The input and output validator for auth API.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import authSchema from './schema';

const authValidator = {
    login: {
        body: {
            credentials: authSchema.credentials
        },
        type: 'cjson', // TODO: this seems to be problem with `raw-body` npm package and streams
        output: {
            token: authSchema.token
        }
    },
    forgot: {
        body: {
            email: authSchema.email
        },
        type: 'cjson'
    },
    credentials: Joi.object({
        email: authSchema.email,
        password: authSchema.password
    }),
    passwordReset: Joi.object({
        password: authSchema.password
    }),
    passwordUpdate: Joi.object({
        currentPassword: authSchema.password,
        password: authSchema.password,
        confirmPassword: Joi.any().valid(Joi.ref('password')).required().options({ language: { any: { allowOnly: 'must match password' } } })
    })
};

export default authValidator;
