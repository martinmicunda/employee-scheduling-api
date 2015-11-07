/**
 * The `settings` API module that provides functionality to create, read, update and delete setting.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import koa from 'koa';
import router from 'koa-joi-router';
import validator from './lib/validator';
import * as settingDAO from './lib/dao';

const app = koa();
const api = router();

const routes = [
    {
        method: 'GET',
        path: '/settings/:id',
        validate: validator.findByID,
        handler: function *() {
            this.body = yield settingDAO.findByID(this.params.id);
        }
    },
    {
        method: 'GET',
        path: '/settings',
        validate : validator.find,
        handler: function *() {
            this.body = yield settingDAO.find();
        }
    },
    {
        method: 'POST',
        path: '/settings',
        validate: validator.insert,
        handler: function *() {
            this.body = yield settingDAO.insert(this.request.body);
            this.status = 201;
        }
    },
    {
        method: 'PUT',
        path: '/settings',
        validate: validator.update,
        handler: function *() {
            this.body = yield settingDAO.update(this.request.body);
        }
    },
    {
        method: 'DELETE',
        path: '/settings/:id',
        validate: validator.remove,
        handler: function *() {
            yield settingDAO.remove(this.params.id);
            this.status = 204;
        }
    }
];

api.route(routes);
app.use(api.middleware());

export default app;
