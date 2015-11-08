/**
 * The `employees` API module that provides functionality to create, read, update and delete partner.
 *
 * @module partners
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import koa from 'koa';
import router from 'koa-joi-router';
import validator from './lib/validator';
import * as employeeService from './lib/service';

const app = koa();
const api = router();

const routes = [
    //{
    //    method: 'GET',
    //    path: '/employees/:id',
    //    validate: validator.findByID,
    //    handler: function *() {
    //        try {
    //            this.body = yield partnerDAO.findByID(this.params.id);
    //        } catch(error) {
    //            this.body = error;
    //            this.status = error.statusCode;
    //        }
    //    }
    //},
    //{
    //    method: 'GET',
    //    path: '/employees',
    //    validate : validator.find,
    //    handler: function *() {
    //        try {
    //            this.body = yield partnerDAO.find();
    //        } catch(error) {
    //            this.body = error;
    //            this.status = error.statusCode;
    //        }
    //    }
    //},
    {
        method: 'POST',
        path: '/',
        validate: validator.insert,
        handler: function *() {
            this.body = yield employeeService.create(this.request.body);
            this.status = 201;
        }
    }
    //{
    //    method: 'PUT',
    //    path: '/employees',
    //    validate: validator.update,
    //    handler: function *() {
    //        try {
    //            this.body = yield partnerDAO.update(this.request.body);
    //        } catch(error) {
    //            this.body = error;
    //            this.status = error.statusCode;
    //        }
    //    }
    //}
];

api.prefix('/api/employees');
api.route(routes);
app.use(api.middleware());

export default app;
