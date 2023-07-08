'use strict';

/**
 * guest-list controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const { sendAck, csvParserAddUser } = require('../../../utils/helper');

module.exports = createCoreController(
  'api::guest-list.guest-list',
  ({ strapi }) => ({
    async uploadGuestList(ctx) {
      const {
        request: { files: { files } = {} },
      } = ctx;

      const { jsonData, purgeData } =
        (await csvParserAddUser(files.path, ctx.state.user.id)) ?? [];

      if (jsonData.length) {
        try {
          for (const iterator of jsonData) {
            await strapi.db
              .query('api::guest-list.guest-list')
              .create({ data: iterator });
          }
        } catch (error) {
          console.error('Error creating entries:', error);
          ctx.send(
            {
              message: error,
            },
            500
          );
        }
      }

      if (purgeData.length) {
        sendAck(
          ctx,
          `Sorry! Due to validation errors we could not add these items, but rest of the items were added.`,
          422,
          purgeData
        );
      } else {
        sendAck(ctx, 'Entries created successfully!');
      }
    },
  })
);
