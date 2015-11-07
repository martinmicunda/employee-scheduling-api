/**
 * Seed the DB with sample languages data.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import languages from './languages.json';
import validator from '../lib/validator';
import * as languageDAO from '../lib/dao';

// make sure we insert only valid data into DB
const schema = Joi.array().items(Joi.object(validator.insert.body));
const result = schema.validate(languages);

if(result.error) {
    throw result.error;
}

// insert data into DB
const inserts = languages.map(o => languageDAO.insert(o, o.code));

export default inserts;
