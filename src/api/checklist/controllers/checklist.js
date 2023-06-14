'use strict';

/**
 * checklist controller
 * custom controller
 */
const { createCoreController } = require('@strapi/strapi').factories;
const _ = require('lodash');

module.exports = createCoreController(
  'api::checklist.checklist',
  ({ strapi }) => ({
    async getCustomChecklist(ctx) {
      // Fetch checklist entries with select fields and populate users
      const entries = await strapi.db
        .query('api::checklist.checklist')
        .findMany({
          select: ['title', 'description', 'months_before'],
          populate: { users: true },
        });

      const currentDate = new Date();

      // Process each checklist entry
      const entities = entries.map(entity => {
        const monthsBefore = entity.months_before;
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - monthsBefore);

        // Check if the current user is present in the users list of the entry
        const isCurrentUserPresent = entity.users?.find(
          user => user.id === ctx.state.user.id
        );

        // Omit the 'users' field from the returned entity
        return _.omit(
          {
            ...entity,
            is_checked: !!isCurrentUserPresent,
            calculatedDate: newDate,
          },
          ['users']
        );
      });

      ctx.send(entities); // Send the processed entities as the response
    },
  })
);
