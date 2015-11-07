/**
 * The schema model that define language.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';

const languageSchema = {
    id: Joi.string().required(),
    code: Joi.string().max(5).required(),
    name: Joi.string().max(60).required(),
    cas: Joi.any().required(),
    type: Joi.string()
};

export default languageSchema;
