/**
 * The schema model that define email details.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';

const emailSchema = {
    from: Joi.string().required(),
    to: Joi.string().email().required(),
    firstName: Joi.string().required(),
    subject: Joi.string().max(60).required(),
    body: Joi.string().max(3200).required()
};

export default emailSchema;
