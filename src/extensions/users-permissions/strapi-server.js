const { SELECT } = require('../../utils/config');
const { sendAck } = require('../../utils/helper');
/**
 * user controller | update user | populate
 //! custom controller
 //! custom populate
 */

module.exports = plugin => {
  plugin.controllers.user.updateMe = async ctx => {
    if (!ctx.state.user || !ctx.state.user.id) {
      return (ctx.response.status = 401);
    }

    const populate = {};
    ctx.request.query?.populate?.map(e => (populate[e] = true));
    const response = await strapi
      .query('plugin::users-permissions.user')
      .update({
        where: { id: ctx.state.user.id },
        data: ctx.request.body,
        populate,
        select: SELECT.user.select,
      });

    sendAck({
      ctx,
      data: response,
    });
  };

  //! custom route
  plugin.routes['content-api'].routes.push({
    method: 'PUT',
    path: '/user/me', //! singular as not to conflict existing routes
    handler: 'user.updateMe', // ! enable NEW** route in user settings
    config: {
      prefix: '',
      policies: [],
    },
  });

  return plugin;
};
