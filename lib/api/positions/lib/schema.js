/**
 * The schema model that define partner.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';

const partnerSchema = {
    id: Joi.string().required(),
    name: Joi.string().max(20).required(),
    contactPerson: Joi.string().allow('').max(60),
    email: Joi.string().allow('').email().max(60),
    phoneNumber: Joi.string().allow('').max(20),
    color: Joi.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).required(),
    status: Joi.string().only('active', 'inactive').required(),
    note: Joi.string().allow('').max(255),
    cas: Joi.any().required(),
    type: Joi.string()
};

export default partnerSchema;
