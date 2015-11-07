/**
 * Seed the DB with sample setting data.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import Joi from 'joi';
import settings from './settings.json';
import validator from '../lib/validator';
import * as settingDAO from '../lib/dao';

// make sure we insert only valid data into DB
const schema = Joi.array().items(Joi.object(validator.insert.body)), settingsVal = [];
settings.map(o => settingsVal.push(o[Object.keys(o)[0]]));
const result = schema.validate(settingsVal);

if(result.error) {
    throw result.error;
}

// insert data into DB
const inserts = settings.map(o => settingDAO.insert(o[Object.keys(o)[0]], Object.keys(o)[0]));

export default inserts;
