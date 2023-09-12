'use strict';
/**
 * supplier-attribute controller
 //! custom controller
 //! custom populate
 */

const { POPULATE, SELECT } = require('../../../utils/config');
const {
  matchAttributesBasedOnTypes,
  sendAck,
  isUserInRange,
} = require('../../../utils/helper');

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  'api::supplier-attribute.supplier-attribute',
  ({ strapi }) => ({
    async postFilterSupplierAttributes(ctx) {
      const { category_id, attributes, user_lat_lng } = ctx.request.body;

      if ((!category_id && !attributes) || !attributes?.length) {
        return sendAck({
          message: 'category and attributes were required',
          ctx,
          statusCode: 400,
        });
      }
      const orQueryBasedAttributes = attributes.map(e => ({
        categories: { id: category_id },
        supplier_attributes: { attribute: { id: e.id } },
      }));

      // Fetch attributes based on category ID
      const filterBasedOnCategory = await strapi.db
        .query('api::attribute.attribute')
        .findMany({
          where: {
            $or: orQueryBasedAttributes,
          },
          populate: {
            category: true,
            supplier_attributes: true,
            user: POPULATE.user,
          },
        });

      let supplier_attributes_Ids = filterBasedOnCategory
        .map(dbAttributes => {
          const userAttribute = attributes.filter(
            attr => attr.id === dbAttributes.id
          );
          const matchedAttributes = dbAttributes.supplier_attributes.filter(
            supplier =>
              userAttribute.some(user =>
                matchAttributesBasedOnTypes(
                  dbAttributes.type,
                  user.value,
                  supplier?.attribute_value
                )
              )
          );
          return matchedAttributes;
        })
        .flat()
        .map(({ id }) => id);

      const findSuppliers = await strapi.db
        .query('api::supplier.supplier')
        .findMany({
          where: {
            supplier_attributes: {
              id: supplier_attributes_Ids,
            },
          },
          populate: {
            ['user']: {
              select: SELECT.user.select,
              populate: {
                user_image: true,
                address: true,
              },
            },
          },
        });
      if (!findSuppliers.length) {
        return sendAck({
          message: 'No supplier present with current filters',
          ctx,
          statusCode: 400,
        });
      }
      let findSuppliersBasedOnLocation = [];
      if (user_lat_lng) {
        //! user wants to filter in range
        findSuppliersBasedOnLocation = findSuppliers.filter(({ user }) => {
          return isUserInRange(user_lat_lng, [
            user?.address?.latitude,
            user?.address?.longitude,
          ]);
        });
      }

      sendAck({
        ctx,
        data: user_lat_lng ? findSuppliersBasedOnLocation : findSuppliers,
      });
    },
  })
);
