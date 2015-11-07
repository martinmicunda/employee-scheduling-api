/**
 * Seed the DB with sample partners data.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import partners from './partners.json';
import validator from '../lib/validator';
import * as partnerDAO from '../lib/dao';

// make sure we insert only valid data into DB
const schema = Joi.array().items(Joi.object(validator.insert.body));
const result = schema.validate(partners);

if(result.error) {
    throw result.error;
}

// insert data into DB
const inserts = partners.map(o => partnerDAO.insert(o));

export default inserts;
