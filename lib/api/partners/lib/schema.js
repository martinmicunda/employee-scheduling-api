/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';

const partnerSchema = {
    id: Joi.string().required(),
    name: Joi.string().required(),
    contactPerson: Joi.string(),
    email: Joi.string().optional().email(),
    phoneNumber: Joi.string().optional(),
    color: Joi.string().required(),
    note: Joi.any().allow(''),
    cas: Joi.any().required()
};

export default partnerSchema;

// NOTE: I should allow null or '' value if the fields is not required and also validate max string. When validation failed return 400 error with failed fields.
