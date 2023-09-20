'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const _ = require('lodash');
const { subtractMonths, sendAck } = require('../../../utils/helper');
var { format } = require('date-fns');

module.exports = createCoreController(
  'api::checklist.checklist',
  ({ strapi }) => ({
    async groupChecklistBasedOnMonthBeforeAndWeddingDate(ctx) {
      const entries = await strapi.db
        .query('api::checklist.checklist')
        .findMany({
          select: ['title', 'description', 'months_before'],
          populate: { users: true },
        });

      const weddingUser = await strapi.db
        .query('api::wedding.wedding')
        .findOne({
          where: {
            users: [ctx.state.user.id],
          },
          select: 'date',
        });

      if (!weddingUser) {
        return sendAck({
          message:
            'Your wedding date is not added in the profile, please add the wedding date',
          ctx,
          statusCode: 400,
        });
      }

      let checkListObj = {};
      entries.map(entity => {
        const checklistDate = format(
          subtractMonths(new Date(weddingUser.date), entity.months_before),
          'MMM d, yyyy'
        );

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

      sendAck({ ctx, data: checkListObj });
    },
  })
);
