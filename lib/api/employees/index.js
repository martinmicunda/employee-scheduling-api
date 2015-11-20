/**
 * The `employees` API module that provides functionality to create, read, update and delete employee.
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
import * as dao from './lib/dao';
import * as service from './lib/service';

const app = koa();
const api = router();

const routes = [
    {
        method: 'GET',
        path: '/:id',
        validate: validator.findByID,
        handler: function *() {
            const data = yield dao.findByID(this.params.id);
            delete data.salt;
            delete data.password;

            this.body = data;
        }
    },
    {
        method: 'GET',
        path: '/:email/unique',
        validate: {},
        handler: function *() {
            yield dao.findByEmail(this.params.email);
            this.status = 204;
        }
    },
    {
        method: 'GET',
        path: '/',
        validate : validator.find,
        handler: function *() {
            this.body = yield dao.find(this.request.query);
        }
    },
    {
        method: 'POST',
        path: '/',
        validate: validator.insert,
        handler: function *() {
            this.body = yield service.create(this.request.body);
            this.status = 201;
        }
    },
    {
        method: 'PUT',
        path: '/:id',
        validate: validator.update,
        handler: function *() {
            this.body = yield dao.update(this.params.id, this.request.body);
        }
    },
    {
        method: 'DELETE',
        path: '/:id',
        validate: validator.remove,
        handler: function *() {
            yield dao.remove(this.params.id);
            this.status = 204;
        }
    },
    {
        method: 'GET',
        path: '/:id/account',
        validate: validator.findAccountDetails,
        handler: function *() {
            this.body = yield service.findAccountDetails(this.params.id);
        }
    },
    {
        method: 'PUT',
        path: '/:id/account',
        validate: validator.updateAccountDetails,
        handler: function *() {
            this.body = yield service.updateAccountDetails(this.params.id, this.request.body);
        }
    }
];

api.prefix('/api/employees');
api.route(routes);
app.use(api.middleware());

export default app;
