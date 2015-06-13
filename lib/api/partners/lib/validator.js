/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

var partnerSchema = require('./schema');

// insert request doesn't have ID and version properties
let insertPartnerSchema = Object.assign({}, partnerSchema);
delete insertPartnerSchema.id;
delete insertPartnerSchema.version;

const partnerValidator = {
    findByID: {
        params: {
            id: partnerSchema.id
        }
        //output: partnerSchema TODO: how to handle this if there is 404 or 500 error?
    },
    find: {},
    insert: {
        body: insertPartnerSchema,
        type: 'cjson'
    },
    update: {
        body: partnerSchema,
        type: 'cjson'
        //output: partnerSchema TODO: how to handle this if there is 404 or 500 error?
    },
    remove: {
        params: {
            id: partnerSchema.id
        }
    }
};

module.exports = partnerValidator;
