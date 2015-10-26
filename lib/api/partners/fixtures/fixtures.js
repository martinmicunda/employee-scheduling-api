/**
 * Seed the DB with sample partner data.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import partners from './partners.json';
import partnerSchema from '../lib/schema';
import * as partnerDAO from '../lib/dao';

// insert request doesn't contain ID and CAS properties
delete partnerSchema.id;
delete partnerSchema.cas;

// make sure we insert only valid data into DB
const schema = Joi.array().items(Joi.object(partnerSchema));
const result = schema.validate(partners);

if(result.error) {
    throw result.error;
}

// insert data into DB
const inserts = partners.map(o => partnerDAO.insert(o));

export default inserts;
