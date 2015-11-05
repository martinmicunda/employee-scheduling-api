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
            email: authSchema.email,
            password: authSchema.password
        },
        type: 'cjson', // TODO: this seems to be problem with `raw-body` npm package and streams
        output: {
            token: authSchema.token
        }
    }
};

export default authValidator;
