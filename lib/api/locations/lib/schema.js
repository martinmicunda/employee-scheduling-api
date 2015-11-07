/**
 * The schema model that define location.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';

const locationSchema = {
    id: Joi.string().required(),
    name: Joi.string().max(60).required(),
    status: Joi.string().only('active', 'inactive').required(),
    default: Joi.boolean().required(),
    cas: Joi.any().required(),
    type: Joi.string()
};

export default locationSchema;
