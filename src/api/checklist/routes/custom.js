module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/checklists-group-by-months-before',
      handler: 'checklist.groupChecklistBasedOnMonthBeforeAndWeddingDate',
    },
  ],
};
