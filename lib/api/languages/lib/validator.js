/**
 * The input and output validator for language API.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import languageSchema from './schema';

// insert request doesn't contain ID and CAS properties
const insertLanguageSchema = Object.assign({}, languageSchema);
delete insertLanguageSchema.id;
delete insertLanguageSchema.cas;

const languageValidator = {
    findByID: {
        params: {
            id: languageSchema.id
        },
        output: languageSchema
    },
    find: {
        output: Joi.array().items(Joi.object(languageSchema))
    },
    insert: {
        body: insertLanguageSchema,
        type: 'cjson',
        output: {
            id: languageSchema.id,
            cas: languageSchema.cas
        }
    },
    update: {
        params: {
            id: languageSchema.id
        },
        body: languageSchema,
        type: 'cjson',
        output: {
            cas: languageSchema.cas
        }
    },
    remove: {
        params: {
            id: languageSchema.id
        }
    }
};

export default languageValidator;
