/**
 * The input and output validator for location API.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import locationSchema from './schema';

// insert request doesn't contain ID and CAS properties
const insertLocationSchema = Object.assign({}, locationSchema);
delete insertLocationSchema.id;
delete insertLocationSchema.cas;

const locationValidator = {
    findByID: {
        params: {
            id: locationSchema.id
        },
        output: locationSchema
    },
    find: {
        output: Joi.array().items(Joi.object(locationSchema))
    },
    insert: {
        body: insertLocationSchema,
        type: 'cjson',
        output: {
            id: locationSchema.id,
            cas: locationSchema.cas
        }
    },
    update: {
        body: locationSchema,
        type: 'cjson',
        output: {
            cas: locationSchema.cas
        }
    },
    remove: {
        params: {
            id: locationSchema.id
        }
    }
};

export default locationValidator;
