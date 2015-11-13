/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import employeeSchema from './schema';

// insert request doesn't contain ID and CAS properties
let insertEmployeeSchema = Object.assign({}, employeeSchema);
delete insertEmployeeSchema.id;
delete insertEmployeeSchema.cas;

const employeeValidator = {
    me: {
        params: {
            id: employeeSchema.id
        },
        output: {
            id: employeeSchema.id,
            cas: employeeSchema.cas,
            avatar: employeeSchema.avatar,
            firstName: employeeSchema.firstName,
            lastName: employeeSchema.lastName,
            email: employeeSchema.email,
            note: employeeSchema.note,
            phoneNumber: employeeSchema.phoneNumber,
            address: employeeSchema.address,
            city: employeeSchema.city,
            zipCode: employeeSchema.zipCode
        }
    },
    findByID: {
        params: {
            id: employeeSchema.id
        },
        output: employeeSchema
    },
    find: {
        output: Joi.array().items({
            id: employeeSchema.id,
            avatar: employeeSchema.avatar,
            firstName: employeeSchema.firstName,
            lastName: employeeSchema.lastName,
            email: employeeSchema.email,
            phoneNumber: employeeSchema.phoneNumber,
            position: employeeSchema.position,
            role: employeeSchema.role,
            status: employeeSchema.status
        })
    },
    insert: {
        body: insertEmployeeSchema,
        type: 'cjson',
        output: {
            id: employeeSchema.id,
            cas: employeeSchema.cas
        }
    },
    update: {
        params: {
            id: employeeSchema.id
        },
        body: employeeSchema,
        type: 'cjson',
        output: {
            cas: employeeSchema.cas
        }
    },
    remove: {
        params: {
            id: employeeSchema.id
        }
    }
};

export default employeeValidator;
