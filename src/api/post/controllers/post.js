'use strict';

/**
 * post controller
 */

const { sendAck } = require('../../../utils/helper');
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::post.post', ({ strapi }) => ({
  async getAccessBasedPosts(ctx) {
    const { user_type, id } = ctx.state.user || {};

    let user_PartnerId;
    let supplier_hiredBy_ids;
    if (user_type === 'supplier') {
      const findSupplierHiredByUser = await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({
          where: {
            id,
          },
          populate: { hired_by: { select: ['id'] } },
        });
      supplier_hiredBy_ids = findSupplierHiredByUser?.hired_by?.map(e => e?.id);
    } else {
      const wedd = await strapi.db.query('api::wedding.wedding').findOne({
        where: {
          users: [id],
        },
        populate: { users: { select: ['id'] } },
      });
      user_PartnerId = wedd?.users?.find(e => e?.id !== id)?.id;
    }

    let orQuery = [
      {
        user: {
          id,
        },
      },
      {
        tags: {
          id,
        },
      },
    ];

    if (user_type === 'supplier' && supplier_hiredBy_ids?.length > 0) {
      supplier_hiredBy_ids?.forEach(id => {
        orQuery.push({
          user: {
            id,
          },
        });
      });
    } else if (user_PartnerId) {
      orQuery.push({
        user: {
          id: user_PartnerId,
        },
      });
    }

    /** //!
     * 1. user self created (bride/groom)
     * 2. user's partner created (bride/groom)
     * 3. user is been tagged (bride/groom/supplier)
     * 4. supplier's hired people created
     */
    const posts = await strapi.db.query('api::post.post').findMany({
      sort: [{ updatedAt: 'desc' }],
      where: {
        $or: orQuery,
      },
      populate: true
      // populate: {
      //   user: { select: ['id'], populate: { user_image: ['url'] } },
      //   tags: { select: ['id'], populate: { user_image: ['url'] } },
      // },
    });

    sendAck({
      ctx,
      data: posts,
    });
  },
}));
