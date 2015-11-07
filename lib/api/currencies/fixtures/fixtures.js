/**
 * Seed the DB with sample currencies data.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import currencies from './currencies.json';
import validator from '../lib/validator';
import * as currencyDAO from '../lib/dao';

// make sure we insert only valid data into DB
const schema = Joi.array().items(Joi.object(validator.insert.body));
const result = schema.validate(currencies);

if(result.error) {
    throw result.error;
}

// insert data into DB
const inserts = currencies.map(o => currencyDAO.insert(o, o.code));

export default inserts;
