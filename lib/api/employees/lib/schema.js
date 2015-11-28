/**
 * The schema model that define employee.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';

const employeeSchema = {
    id: Joi.string().required(),
    firstName: Joi.string().max(60).required(),
    lastName: Joi.string().max(60).required(),
    avatar: Joi.string().uri().max(250).required(),
    email: Joi.string().email().max(60).required(),
    language: Joi.string().required(),
    position: Joi.string().required(),
    role: Joi.string().only('employee', 'supervisor', 'manager', 'admin').required(),
    status: Joi.string().only('active', 'inactive', 'pending').required(),
    phoneNumber: Joi.string().allow('').max(60),
    address: Joi.string().allow('').max(255),
    city: Joi.string().allow('').max(60),
    zipCode: Joi.string().allow('').max(60),
    bankName: Joi.string().allow('').max(60),
    bankAccountName: Joi.string().allow('').max(60),
    bankAccountNumber: Joi.string().allow('').max(60),
    hourlyRate: Joi.number().positive().required(),
    currencyCode: Joi.string().required(),
    currencySymbol: Joi.string().required(),
    locations: Joi.array().min(1),
    supervisorLocations: Joi.array(),
    personalNo: Joi.string().allow('').max(60),
    identityNo: Joi.string().allow('').max(60),
    note: Joi.string().allow('').max(255),
    cas: Joi.any().required(),
    type: Joi.string(),
    createdAt: Joi.date().iso(),
    updatedAt: Joi.date().iso(),
    password: Joi.any().forbidden(),
    salt: Joi.any().forbidden()
};

export default employeeSchema;
//TODO: change avatar to avatarUrl
//"avatarUrl": "https://avocado.s3.amazonaws.com/path-to-avatar.png",
//    "avatarImageUrls": {
//    "small": "https://avocado.s3.amazonaws.com/path-to-avatar.png",
//        "medium": "https://avocado.s3.amazonaws.com/path-to-avatar.png"
//},
