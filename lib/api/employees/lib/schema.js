/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

var Joi = require('joi');

const employeeStatus = {
    active: 'ACTIVE',
    inactive: 'INACTIVE'
};

const employeeSchema = {
    id: Joi.number().integer(),
    taskId: Joi.number().integer(),
    //imageUrl: Joi.string(),
    status: Joi.any().allow([employeeStatus.active, employeeStatus.inactive]).required()
};

module.exports = employeeStatus; // will be needed when I am creating employee and what status should be assigned
module.exports = employeeSchema;
