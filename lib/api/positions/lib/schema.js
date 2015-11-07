/**
 * The schema model that define position.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';

const partnerSchema = {
    id: Joi.string().required(),
    name: Joi.string().max(60).required(),
    cas: Joi.any().required(),
    type: Joi.string()
};

export default partnerSchema;
