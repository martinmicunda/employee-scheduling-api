/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

var employeeSchema = require('./schema');

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
    }
};

module.exports = employeeValidator;
