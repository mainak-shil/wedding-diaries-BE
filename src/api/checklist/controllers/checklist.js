'use strict';

const { createCoreController } = require('@strapi/strapi').factories;
const _ = require('lodash');
const { sendAck, splitToMonthAndWeek } = require('../../../utils/helper');
var { format, sub } = require('date-fns');

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
        const monthWeek = splitToMonthAndWeek(entity.months_before);
        const checklistDate = format(
          sub(new Date(weddingUser?.date), {
            months: monthWeek.month,
            weeks: monthWeek.week,
          }),
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
    async stripeWebhook(ctx) {
      console.log('entered');
      const event = ctx.request.body;
      console.log('event', event?.type);
      console.log('event', event?.data?.object);

      sendAck({ ctx, message: 'success' });
    },
  })
);
