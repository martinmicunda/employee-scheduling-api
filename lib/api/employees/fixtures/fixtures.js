/**
 * Seed the DB with sample employees data.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import employees from './employees.json';
import validator from '../lib/validator';
import * as dao from '../lib/dao';

// make sure we insert only valid data into DB
const schema = Joi.array().items(Joi.object(validator.insert.body));
const result = schema.validate(employees);

if(result.error) {
    throw result.error;
}

// insert data into DB
const inserts = employees.map(o => {
    o.salt = 'SCchCPDLaesZw3lRx2wUEA==';
    o.password = '32phwu6xLErwk5tFR1idC6LJfdjSQ3PA+A7GRDbZqYmL0HoMI1vbltz7SbgpmR6dXPI1OFLDxsFdbQS1MWdCIA=='; // encrypted password is 'password'
    dao.insert(o);
});

export default inserts;
