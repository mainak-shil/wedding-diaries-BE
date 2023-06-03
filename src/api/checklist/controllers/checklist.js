"use strict";

/**
 * checklist controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const _ = require("lodash");

module.exports = createCoreController(
  "api::checklist.checklist",
  ({ strapi }) => ({
    async getCustomChecklist(ctx) {
      let entities;

      const entries = await strapi.db
        .query("api::checklist.checklist")
        .findMany({
          select: ["title", "description", "months_before"],
          // where: { title: 'Hello World' },
          // orderBy: { publishedAt: 'DESC' },
          populate: { users: true },
        });
      const currentDate = new Date();
      entities = entries.map((entity) => {
        const monthsBefore = entity.months_before;
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - monthsBefore);
        const isCurrentUserPresent = entity.users?.find(
          (user) => user.id === ctx.state.user.id
        );

        // return {
        //   ...entity,
        //   is_checked: !!isCurrentUserPresent,
        //   calculatedDate: newDate,
        // };
        return _.omit(
          {
            ...entity,
            is_checked: !!isCurrentUserPresent,
            calculatedDate: newDate,
          },
          ["users"]
        );
      });
      ctx.send(entities);
      // ctx.body = entities;
    },
  })
);
