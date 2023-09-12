module.exports = plugin => {
  //! custom controller
  plugin.controllers.user.updateMe = async ctx => {
    if (!ctx.state.user || !ctx.state.user.id) {
      return (ctx.response.status = 401);
    }

    await strapi
      .query('plugin::users-permissions.user')
      .update({
        where: { id: ctx.state.user.id },
        data: ctx.request.body,
      })
      .then(res => {
        ctx.response.status = 200;
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
