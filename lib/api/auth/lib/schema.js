/**
 * The schema model that define credentials details.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';

const authSchema = {
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(30).required(),
    token: Joi.string().required(),
    credentials: Joi.string().required()
};

export default authSchema;
