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
        path: '/:id',
        validate: validator.findByID,
        handler: function *() {
            this.body = yield settingDAO.findByID(this.params.id);
        }
    },
    {
        method: 'GET',
        path: '/',
        validate : validator.find,
        handler: function *() {
            this.body = yield settingDAO.find();
        }
    },
    {
        method: 'POST',
        path: '/',
        validate: validator.insert,
        handler: function *() {
            this.body = yield settingDAO.insert(this.request.body);
            this.status = 201;
        }
    },
    {
        method: 'PUT',
        path: '/:id',
        validate: validator.update,
        handler: function *() {
            this.body = yield settingDAO.update(this.params.id, this.request.body);
        }
    },
    {
        method: 'DELETE',
        path: '/:id',
        validate: validator.remove,
        handler: function *() {
            yield settingDAO.remove(this.params.id);
            this.status = 204;
        }
    }
];

api.prefix('/api/settings');
api.route(routes);
app.use(api.middleware());

export default app;
