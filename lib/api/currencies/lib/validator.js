/**
 * The input and output validator for currency API.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import currencySchema from './schema';

// insert request doesn't contain ID and CAS properties
const insertCurrencySchema = Object.assign({}, currencySchema);
delete insertCurrencySchema.id;
delete insertCurrencySchema.cas;

const currencyValidator = {
    findByID: {
        params: {
            id: currencySchema.id
        },
        output: currencySchema
    },
    find: {
        output: Joi.array().items(Joi.object(currencySchema))
    },
    insert: {
        body: insertCurrencySchema,
        type: 'cjson',
        output: {
            id: currencySchema.id,
            cas: currencySchema.cas
        }
    },
    update: {
        body: currencySchema,
        type: 'cjson',
        output: {
            cas: currencySchema.cas
        }
    },
    remove: {
        params: {
            id: currencySchema.id
        }
    }
};

export default currencyValidator;
