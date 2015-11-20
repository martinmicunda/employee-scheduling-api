/**
 * This module is an adapter to expose i18n global access to locale strings.
 *
 * @module i18n
 * @example
 * ```js
 * import i18n from './i18n';
 * import i18nKoa from 'koa-i18n';
 *
 * app.use(i18n(app, {
 *     directory: path.join(__dirname, '../locales'),
 *     locales: ['en', 'sk'],
 *     extension: '.json'
 * }));
 *
 * app.use(function *setDefaultLocale(next){
 *     i18nAdapter.init(this.i18n);
 *
 *     yield next;
 * });
 * ```
 *
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

/**
 * An adapter class to expose global access to locale strings.
 *
 * @class
 */
class I18nAdapter {
    constructor() {
        this.i18n = {};
    }

    init(i18n) {
        this.i18n = i18n;
    }

    __(...args) {
        return this.i18n.__(...args);
    }
}

export default new I18nAdapter();
