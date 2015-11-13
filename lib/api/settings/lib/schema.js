/**
 * The schema model that define partner.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';

const settingSchema = {
    id: Joi.string().required(),
    language: Joi.string().max(20).required(),
    currencyCode: Joi.string().max(5).required(),
    currencySymbol: Joi.string().max(5).required(),
    avatar: Joi.string().uri().required(),
    adminEmail: Joi.string().allow('').email(),
    cas: Joi.any().required(),
    type: Joi.string()
};

export default settingSchema;
