module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/user-wedding-hired-details',
      handler: 'wedding.userWeddingHiredDetails',
    },
    {
      method: 'GET',
      path: '/get-all-wedding-hired-for',
      handler: 'wedding.getAllWeedingHiredFor',
    },
  ],
};
