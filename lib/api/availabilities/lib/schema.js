/**
 * The schema model that define availability.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';

const availabilitySchema = {
    id: Joi.string().required(),
    date: Joi.date().format('YYYYMMDD').required(),
    employeeId: Joi.string().required(),
    availability: Joi.string().only('available', 'unavailable', 'necessary').required(),
    note: Joi.string().allow('').max(140),
    type: Joi.string()
};

export default availabilitySchema;
