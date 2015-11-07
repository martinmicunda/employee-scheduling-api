/**
 * The `positions` API module that provides functionality to create, read, update and delete position.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import koa from 'koa';
import router from 'koa-joi-router';
import validator from './lib/validator';
import * as positionDAO from './lib/dao';

const app = koa();
const api = router();

const routes = [
    {
        method: 'GET',
        path: '/positions/:id',
        validate: validator.findByID,
        handler: function *() {
            this.body = yield positionDAO.findByID(this.params.id);
        }
    },
    {
        method: 'GET',
        path: '/positions',
        validate : validator.find,
        handler: function *() {
            this.body = yield positionDAO.find();
        }
    },
    {
        method: 'POST',
        path: '/positions',
        validate: validator.insert,
        handler: function *() {
            this.body = yield positionDAO.insert(this.request.body);
            this.status = 201;
        }
    },
    {
        method: 'PUT',
        path: '/positions',
        validate: validator.update,
        handler: function *() {
            this.body = yield positionDAO.update(this.request.body);
        }
    },
    {
        method: 'DELETE',
        path: '/positions/:id',
        validate: validator.remove,
        handler: function *() {
            yield positionDAO.remove(this.params.id);
            this.status = 204;
        }
    }
];

api.route(routes);
app.use(api.middleware());

export default app;
