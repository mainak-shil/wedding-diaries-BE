module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/upload-guest-list',
      handler: 'guest-list.uploadGuestList',
    },
  ],
};
