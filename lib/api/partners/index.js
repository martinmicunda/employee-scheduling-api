/**
 * The `partners` API module that provides functionality to create, read, update and delete partner.
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import koa from 'koa';
import router from 'koa-joi-router';
import validator from './lib/validator';
import * as partnerDAO from './lib/dao';

const app = koa();
const api = router();

const routes = [
    {
        method: 'GET',
        path: '/:id',
        validate: validator.findByID,
        handler: function *() {
            this.body = yield partnerDAO.findByID(this.params.id);
        }
    },
    {
        method: 'GET',
        path: '/',
        validate : validator.find,
        handler: function *() {
            this.body = yield partnerDAO.find();
        }
    },
    {
        method: 'POST',
        path: '/',
        validate: validator.insert,
        handler: function *() {
            this.body = yield partnerDAO.insert(this.request.body);
            this.status = 201;
        }
    },
    {
        method: 'PUT',
        path: '/',
        validate: validator.update,
        handler: function *() {
            this.body = yield partnerDAO.update(this.request.body);
        }
    },
    {
        method: 'DELETE',
        path: '/:id',
        validate: validator.remove,
        handler: function *() {
            yield partnerDAO.remove(this.params.id);
            this.status = 204;
        }
    }
];

api.prefix('/api/partners');
api.route(routes);
app.use(api.middleware());

export default app;
// !!! READ this article https://programmaticponderings.wordpress.com/2015/05/18/building-a-microservices-based-rest-api-with-restexpress-java-and-mongodb-part-1/
// !!! API DOC https://github.com/cliftonc/seguir/blob/master/server%2Findex.js !!!!!
