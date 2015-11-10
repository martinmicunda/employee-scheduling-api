/**
 * The input and output validator for position API.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import positionSchema from './schema';

// insert request doesn't contain ID and CAS properties
const insertPositionSchema = Object.assign({}, positionSchema);
delete insertPositionSchema.id;
delete insertPositionSchema.cas;

const positionValidator = {
    findByID: {
        params: {
            id: positionSchema.id
        },
        output: positionSchema
    },
    find: {
        output: Joi.array().items(Joi.object(positionSchema))
    },
    insert: {
        body: insertPositionSchema,
        type: 'cjson',
        output: {
            id: positionSchema.id,
            cas: positionSchema.cas
        }
    },
    update: {
        params: {
            id: positionSchema.id
        },
        body: positionSchema,
        type: 'cjson',
        output: {
            cas: positionSchema.cas
        }
    },
    remove: {
        params: {
            id: positionSchema.id
        }
    }
};

export default positionValidator;
