module.exports = plugin => {
  plugin.controllers.user.updateMe = async ctx => {
    // ...
  };

  plugin.routes['content-api'].routes.push({
    method: 'PUT',
    path: '/user/<example>',
    handler: 'user.updateMe',
    config: {
      prefix: '',
      policies: [],
    },
  });

  return plugin;
};
