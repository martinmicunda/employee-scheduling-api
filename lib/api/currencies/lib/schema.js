/**
 * The schema model that define currency.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';

const currencySchema = {
    id: Joi.string().required(),
    code: Joi.string().max(5).required(),
    symbol: Joi.string().max(20).required(),
    cas: Joi.any().required(),
    type: Joi.string()
};

export default currencySchema;
