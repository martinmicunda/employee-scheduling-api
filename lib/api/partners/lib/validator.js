/**
 * The input and output validator for partner API.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import partnerSchema from './schema';

// insert request doesn't contain ID and CAS properties
const insertPartnerSchema = Object.assign({}, partnerSchema);
delete insertPartnerSchema.id;
delete insertPartnerSchema.cas;

const partnerValidator = {
    findByID: {
        params: {
            id: partnerSchema.id
        },
        output: partnerSchema
    },
    find: {
        //header: Joi.object({'Accept': Joi.any().valid('application/json').required()}),
        output: Joi.array().items(Joi.object(partnerSchema))
    },
    insert: {
        body: insertPartnerSchema,
        type: 'cjson', // TODO: this seems to be problem with `raw-body` npm package and streams
        output: {
            id: partnerSchema.id,
            cas: partnerSchema.cas
        }
    },
    update: {
        params: {
            id: partnerSchema.id
        },
        body: partnerSchema,
        type: 'cjson',
        output: {
            cas: partnerSchema.cas
        }
    },
    remove: {
        params: {
            id: partnerSchema.id
        }
    }
};

export default partnerValidator;
// https://calendee.com/2013/12/08/custom-validation-output-in-hapi-js/
