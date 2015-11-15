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
    findAccountDetails: {
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
    updateAccountDetails: {
        params: {
            id: employeeSchema.id
        },
        body: {
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
        },
        type: 'cjson',
        output: {
            cas: employeeSchema.cas
        }
    },
    findByID: {
        params: {
            id: employeeSchema.id
        },
        output: employeeSchema
    },
    unique: {
        params: {
            email: employeeSchema.email
        }
    },
    find: {
        query: {
            fields: Joi.string()
        },
        //output: Joi.array().items( // FIXME: it should not pass salt and password fields in response
        //    //Joi.object().keys({
        //    //    salt: Joi.string().options({stripUnknown: true}),
        //    //    password: Joi.string().options({stripUnknown: true})
        //    //}).options({presence: 'optional', allowUnknown: true})
        //)
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
