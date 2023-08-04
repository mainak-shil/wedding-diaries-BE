'use strict';

/**
 * #custom_controller
 * checklist controller
 */
const { createCoreController } = require('@strapi/strapi').factories;
const _ = require('lodash');
const { subtractMonths } = require('../../../utils/helper');
var { format } = require('date-fns');

module.exports = createCoreController(
  'api::checklist.checklist',
  ({ strapi }) => ({
    async groupChecklistBasedOnMonthBeforeAndWeddingDate(ctx) {
      // Fetch checklist entries with select fields and populate users
      const entries = await strapi.db
        .query('api::checklist.checklist')
        .findMany({
          select: ['title', 'description', 'months_before'],
          populate: { users: true },
        });

      //! get wedding date
      const weddingUser = await strapi.db
        .query('api::wedding.wedding')
        .findOne({
          where: {
            users: [ctx.state.user.id],
          },
          select: 'date',
        });

      let checkListObj = {};
      // Process each checklist entry
      entries.map(entity => {
        //! calc the date from wedding date
        const checklistDate = format(
          subtractMonths(new Date(weddingUser.date), entity.months_before),
          'MMM d, yyyy'
        );

        //! Check if the current user is present in the users list of the entry
        //! i.e user have checked the item
        const isCurrentUserPresent = entity.users?.find(
          user => user.id === ctx.state.user.id
        );

        const checklistMod = _.omit(
          {
            ...entity,
            is_checked: !!isCurrentUserPresent,
          },
          ['users']
        );

        if (!checkListObj[checklistDate]) {
          checkListObj[checklistDate] = [checklistMod];
        } else {
          checkListObj[checklistDate].push(checklistMod);
        }
      });

      ctx.send(checkListObj); // Send the processed entities as the response
    },
  })
);
