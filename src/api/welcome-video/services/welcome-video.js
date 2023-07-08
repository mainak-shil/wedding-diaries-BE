'use strict';

/**
 * welcome-video service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::welcome-video.welcome-video');
