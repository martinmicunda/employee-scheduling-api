/**
 * Seed the DB with sample locations data.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import locations from './locations.json';
import validator from '../lib/validator';
import * as locationDAO from '../lib/dao';

// make sure we insert only valid data into DB
const schema = Joi.array().items(Joi.object(validator.insert.body));
const result = schema.validate(locations);

if(result.error) {
    throw result.error;
}

// insert data into DB
const inserts = locations.map(o => locationDAO.insert(o));

export default inserts;
