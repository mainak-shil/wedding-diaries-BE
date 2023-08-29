'use strict';
/**
 * #custom_controller
 * wedding controller
 */

const { POPULATE } = require('../../../utils/config');
const { sendAck } = require('../../../utils/helper');
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::wedding.wedding', ({ strapi }) => ({
  async userWeddingHiredDetails(ctx) {
    const { hired_by_user_id } = ctx.request.body;

    //! find supplier, hired by the user
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
    //! filter on all the hired users
    const findUserWhoHired = findSupplierHiredByUser?.hired_by.find(
      ({ id }) => id === hired_by_user_id
    );
    //! get the wedding details with the member
    const wedding = await strapi.db.query('api::wedding.wedding').findOne({
      where: {
        users: findUserWhoHired?.id,
      },
      populate: { users: POPULATE.user },
    });
    sendAck({ ctx, data: wedding });
  },

  async getAllWeedingHiredFor(ctx) {
    //! find supplier
    const findSupplierHiredByUser = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: {
          id: ctx.state.user.id,
        },
        populate: { hired_by: true },
      });
    //! get all the hired users
    const hireByUserIds = findSupplierHiredByUser?.hired_by?.map(
      ({ id }) => id
    );
    //! get the weeding's with the user ids
    const wedding = await strapi.db.query('api::wedding.wedding').findMany({
      where: {
        users: hireByUserIds,
      },
      populate: { users: POPULATE.user },
    });
    sendAck({ ctx, data: wedding });
  },
  //!todo
  async supplierProjects(ctx) {
    //! get wedding relations of users <- hired_to <- supplier

    //! find user, hired by the user
    const findHiredByUsers = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({
        where: {
          id: ctx.state.user.id,
        },
        populate: { hired_by: true },
      });
    if (!findHiredByUsers) {
      return sendAck({
        ctx,
        message: `Sorry! We could not found the users that hired you!`,
        statusCode: 404,
      });
    }
    //! find that user in wedding table
    //! get wedding users, patners
    const wedding = await strapi.db.query('api::wedding.wedding').findMany({
      where: {
        users: hireByUserIds,
      },
      populate: { users: POPULATE.user },
    });


    sendAck({ ctx, data: findHiredByUsers });
  },
}));
