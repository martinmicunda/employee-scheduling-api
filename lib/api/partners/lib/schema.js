/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

var Joi = require('joi');

const partnerSchema = {
    id: Joi.string().required(),
    name: Joi.string().required(),
    contactPerson: Joi.string(),
    email: Joi.string().optional().email(),
    phoneNumber: Joi.string().optional(),
    color: Joi.string().required(),
    note: Joi.any().allow(''),
    version: Joi.any().required()
};

module.exports = partnerSchema;
