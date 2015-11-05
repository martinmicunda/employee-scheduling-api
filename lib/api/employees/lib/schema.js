/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';

const employeeSchema = {
    id: Joi.string().required(),
    firstName: Joi.string().max(20).required(),
    email: Joi.string().allow('').email().max(60),
    status: Joi.string().only('active', 'inactive', 'pending').required(),
    cas: Joi.any().required(),
    type: Joi.string()
};

export default employeeSchema;

