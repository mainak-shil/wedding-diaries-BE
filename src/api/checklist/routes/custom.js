module.exports = {
  routes: [
    {
      method: "GET",
      path: "/checklists-custom",
      handler: "checklist.getCustomChecklist",
    },
  ],
};
