const { sendAck } = require('../../utils/helper');

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
        select: ['id', 'username', 'email', 'name'],
      });

    sendAck({
      ctx,
      data: response,
    });
  };

  plugin.routes['content-api'].routes.push({
    method: 'PUT',
    path: '/user/me',
    handler: 'user.updateMe',
    config: {
      prefix: '',
      policies: [],
    },
  });

  return plugin;
};
