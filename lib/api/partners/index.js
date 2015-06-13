/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

var koa       = require('koa');
var router    = require('koa-joi-router');
var service   = require('./lib/service');
var validator = require('./lib/validator');

const app = koa();
const api = router();

const routes = [
    {
        method: 'GET',
        path: '/partners/:id',
        validate: validator.findByID,
        handler: function *() {
            const respond = yield service.findByID(this.params.id);

            this.body = respond.data;
            this.status = respond.statusCode;
        }
    },
    {
        method: 'GET',
        path: '/partners',
        validate : service.find,
        handler: function *() {
            const respond = yield service.find();

            this.body = respond.data;
            this.status = respond.statusCode;
        }
    },
    {
        method: 'POST',
        path: '/partners',
        validate: validator.insert,
        handler: function *() {
            const respond = yield service.insert(this.request.body);

            this.body = respond.data;
            this.status = respond.statusCode;
        }
    },
    {
        method: 'PUT',
        path: '/partners',
        validate: validator.update,
        handler: function *() {
            const respond = yield service.update(this.request.body);

            this.body = respond.data;
            this.status = respond.statusCode;
        }
    },
    {
        method: 'DELETE',
        path: '/partners/:id',
        //validate: validator.remove,
        handler: function *() {
            const respond = yield service.remove(this.params.id);

            this.status = respond.statusCode;
        }
    }
];

for(let route of routes) {
    api.route(route);
}
app.use(api.middleware());

module.exports = app;
