/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import employeeSchema from './schema';

// insert request doesn't contain ID and CAS properties
let insertEmployeeSchema = Object.assign({}, employeeSchema);
delete insertEmployeeSchema.id;
delete insertEmployeeSchema.cas;

const employeeValidator = {
    findByID: {
        params: (() => ({
            id: employeeSchema.id
        }))()
    },
    find: {
        query: (function query() {
            return {
                description : employeeSchema.description
            };
        })()
    },
    insert: {
        body: insertEmployeeSchema,
        type: 'cjson', // TODO: this seems to be problem with `raw-body` npm package and streams
        output: {
            id: employeeSchema.id,
            cas: employeeSchema.cas
        }
    }
};

export default employeeValidator;
