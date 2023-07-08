'use strict';

/**
 * post-reply service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::post-reply.post-reply');
