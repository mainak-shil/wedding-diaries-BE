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
} = require('../../../utils/helper');

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  'api::supplier-attribute.supplier-attribute',
  ({ strapi }) => ({
    async postFilterSupplierAttributes(ctx) {
      const { category_id, attributes } = ctx.request.body;

      // Fetch attributes based on category ID
      const filterBasedOnCategory = await strapi.db
        .query('api::attribute.attribute')
        .findMany({
          where: { categories: { id: category_id } },
          populate: {
            category: true,
            supplier_attributes: true,
            user: POPULATE.user,
          },
        });
      // Filter and map supplier attribute IDs based on matching conditions
      const supplier_attributes_ids = filterBasedOnCategory
        .filter(
          obj1 =>
            attributes.some(user_attributes => obj1.id === user_attributes.id) // filter user selected type of attributes
        )
        .filter(obj1 => {
          const supplierAttribute = obj1.supplier_attributes[0]; // pick 0'th as, multiple means user have multiple attribute values
          // console.log('supplierAttribute',supplierAttribute);
          const userAttribute = attributes.find(attr => attr.id === obj1.id);
          // console.log('userAttribute',userAttribute);
          return matchAttributesBasedOnTypes(
            obj1.type,
            userAttribute.value,
            supplierAttribute?.attribute_value
          );
        })
        .map(obj1 => obj1.supplier_attributes[0]?.id);
      // console.log('supplier_attributes_ids',supplier_attributes_ids);

      // Fetch suppliers based on filtered supplier attribute IDs
      const findSuppliers = await strapi.db
        .query('api::supplier.supplier')
        .findMany({
          where: {
            supplier_attributes: {
              id: supplier_attributes_ids,
            },
          },
          //! custom populate
          populate: {
            ['user']: {
              select: SELECT.user.select,
              populate: {
                user_image: true,
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
      sendAck({ ctx, data: findSuppliers });
    },
  })
);
