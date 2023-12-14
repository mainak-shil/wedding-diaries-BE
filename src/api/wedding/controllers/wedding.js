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
          select: ['id', 'email', 'name', 'phone'],
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
          populate: ['address', 'user_image'],
          select: ['id', 'email', 'name', 'user_type'],
        },
      },
    });
    sendAck({ ctx, data: wedding });
  },

  //! list of users who were single, not connected with any user
  async getAllSingleUser(ctx) {
    //! check if user is bride or groom
    const thisUser = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: {
          id: ctx.state.user.id,
        },
        select: ['user_type', 'id'],
      });

    const wedding = await strapi.db.query('api::wedding.wedding').findMany({
      select: ['id'],
      populate: {
        users: {
          select: ['id', 'user_type', 'name'],
        },
      },
    });

    const excludeAlreadyUsersConnectedIds = wedding
      .filter(
        item =>
          item.users.length === 2 &&
          item.users.some(
            user => user.user_type === 'groom' && user.id !== thisUser.id
          ) &&
          item.users.some(
            user => user.user_type === 'bride' && user.id !== thisUser.id
          )
      )
      .flatMap(item => item.users.map(user => user.id));

    const singleUsers = await strapi.db
      .query('plugin::users-permissions.user')
      .findMany({
        where: {
          confirmed: true,
          blocked: false,
          id: {
            $not: {
              $in: [...excludeAlreadyUsersConnectedIds],
            },
          },
          user_type: {
            $not: {
              $in: [thisUser.user_type, 'supplier'],
            },
          },
        },
        select: ['id', 'email', 'name', 'user_type'],
        populate: ['user_image'],
        // populate: {
        //   user_image: { select: ['url'] },
        // },
      });

    sendAck({ ctx, data: singleUsers });
  },
}));
