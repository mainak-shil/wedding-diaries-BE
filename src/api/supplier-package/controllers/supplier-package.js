'use strict';

/**
 * supplier-package controller
 */

const { sendAck } = require('../../../utils/helper');
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  'api::supplier-package.supplier-package',
  ({ strapi }) => ({
    async postMultiSupplierPackages(ctx) {
      const { packages, supplierId } = ctx.request.body?.data || {};
      if (!packages?.length || !supplierId) {
        return sendAck({
          ctx,
          message: `Packages and supplierId is mandatory`,
          statusCode: 404,
        });
      }
      try {
        for (const p of packages) {
          await strapi.db
            .query('api::supplier-package.supplier-package')
            .create({
              data: {
                ...p,
                supplier: {
                  connect: supplierId,
                },
              },
            });
        }
      } catch (error) {
        sendAck({
          ctx,
          message: `Sorry something went wrong, please retry`,
          statusCode: 500,
        });
      }

      sendAck({ ctx, message: 'ok' });
    },
  })
);
