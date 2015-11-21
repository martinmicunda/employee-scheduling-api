/**
 * The input and output validator for email API.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import emailSchema from './schema';

const emailValidator = {
    insert: {
        body: emailSchema,
        type: 'cjson'
    }
};

export default emailValidator;
