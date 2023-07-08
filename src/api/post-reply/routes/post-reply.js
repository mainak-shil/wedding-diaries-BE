'use strict';

/**
 * post-reply router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::post-reply.post-reply');
