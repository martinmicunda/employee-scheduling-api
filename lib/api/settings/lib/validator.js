/**
 * The input and output validator for partner API.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import settingSchema from './schema';

// insert request doesn't contain ID and CAS properties
const insertSettingSchema = Object.assign({}, settingSchema);
delete insertSettingSchema.id;
delete insertSettingSchema.cas;

const settingValidator = {
    findByID: {
        params: {
            id: settingSchema.id
        },
        output: settingSchema
    },
    find: {
        output: Joi.array().items(Joi.object(settingSchema))
    },
    insert: {
        body: insertSettingSchema,
        type: 'cjson', // TODO: this seems to be problem with `raw-body` npm package and streams
        output: {
            id: settingSchema.id,
            cas: settingSchema.cas
        }
    },
    update: {
        body: settingSchema,
        type: 'cjson',
        output: {
            cas: settingSchema.cas
        }
    },
    remove: {
        params: {
            id: settingSchema.id
        }
    }
};

export default settingValidator;
