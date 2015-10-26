/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

function getMessage(status) {
    let message;

    switch(status) {
        case 200:
            message = 'Ok';
            break;
        case 201:
            message = 'Created';
            break;
        case 304:
            message = 'Not Modified';
            break;
        case 400:
            message = 'Bad Request';
            break;
        case 401:
            message = 'Not Authorized';
            break;
        case 403:
            message = 'Forbidden';
            break;
        case 404:
            message = 'Resource Not Found';
            break;
        case 405:
            message = 'Method Not Allowed';
            break;
        case 409:
            message = 'Conflict';
            break;
        case 415:
            message = 'Unsupported Media Type';
            break;
        default:
            message = 'Internal Server Error';
    }

    return message;
}

/**
 * Creates an http error object.
 *
 * @param {Number} status holds redundantly the HTTP error status code, so that the developer can “see” it without having to analyze the response’s header
 * @param {String} description more description about error
 * @param {String} message short description of the error, what might have cause it and possibly a “fixing” proposal
 * @param {Number} code this is an internal code specific to the API (should be more relevant for business exceptions)
 * @param {String} link points to an online resource, where more details can be found about the error
 * @returns {httpError}
 */
function httpError(status, description, message = getMessage(status), code = 0, link = 'http://docs.mysite.com/errors/') {
    return Object.freeze({
        code: code,
        status: status,
        message: message,
        description: description,
        link: link + code
    });
}

export default httpError;
// see express section http://machadogj.com/2013/4/error-handling-in-nodejs.html
// see example code http://stackoverflow.com/questions/27275957/webstorm-9-autocompletion-node-js-module-jsdoc
// http://www.nodewiz.biz/nodejs-error-handling-pattern/
// http://kostasbariotis.com/rest-api-error-handling-with-express-js/
// !!!!!! http://dailyjs.com/2014/01/30/exception-error/
// https://gist.github.com/justmoon/15511f92e5216fa2624b
// HttpError , DbError -> DatabaseError for name of error
// http://www.tothenew.com/blog/defining-custom-errors-nodejs/
// https://github.com/hapijs/boom
// https://github.com/One-com/node-httperrors
