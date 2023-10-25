'use strict';

const { sendAck } = require('../../../utils/helper');
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::wedding.wedding', ({ strapi }) => ({
  async userWeddingHiredDetails(ctx) {
    const { hired_by_user_id } = ctx.request.body;

    const findSupplierHiredByUser = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: {
          id: ctx.state.user.id,
          hired_by: hired_by_user_id,
        },
        populate: { hired_by: true },
      });
    if (!findSupplierHiredByUser) {
      return sendAck({
        ctx,
        message: `Sorry! We could not found the user that hired you!`,
        statusCode: 404,
      });
    }
    const findUserWhoHired = findSupplierHiredByUser?.hired_by.find(
      ({ id }) => id === hired_by_user_id
    );
    const wedding = await strapi.db.query('api::wedding.wedding').findOne({
      where: {
        users: findUserWhoHired?.id,
      },
      populate: {
        users: {
          populate: ['user_image', 'address'],
          select: ['id', 'username', 'email', 'name'],
        },
      },
    });
    sendAck({ ctx, data: wedding });
  },
  async getAllWeedingHiredFor(ctx) {
    const findSupplierHiredByUser = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: {
          id: ctx.state.user.id,
        },
        populate: { hired_by: true },
      });
    const hireByUserIds = findSupplierHiredByUser?.hired_by?.map(
      ({ id }) => id
    );
    const wedding = await strapi.db.query('api::wedding.wedding').findMany({
      where: {
        users: hireByUserIds,
      },
      populate: {
        users: {
          populate: ['user_image', 'address'],
          select: ['id', 'username', 'email', 'name'],
        },
      },
    });
    sendAck({ ctx, data: wedding });
  },
}));
