'use strict';
/**
 * supplier-attribute controller
 * custom controller
 */

const { POPULATE } = require('../../../utils/config');
const { matchAttributesBasedOnTypes } = require('../../../utils/helper');

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
          where: {
            category: {
              id: category_id,
            },
          },
          populate: {
            category: true,
            supplier_attributes: true,
            user: POPULATE.user,
          },
        });

      // Filter and map supplier attribute IDs based on matching conditions
      const supplier_attributes_ids = filterBasedOnCategory
        .filter(obj1 =>
          attributes.some(user_attributes => obj1.id === user_attributes.id)
        )
        .filter(obj1 => {
          const supplierAttribute = obj1.supplier_attributes[0];
          const userAttribute = attributes.find(attr => attr.id === obj1.id);
          return matchAttributesBasedOnTypes(
            obj1.type,
            userAttribute.value,
            supplierAttribute?.attribute_value
          );
        })
        .map(obj1 => obj1.supplier_attributes[0]?.id);

      // Fetch suppliers based on filtered supplier attribute IDs
      const findSuppliers = await strapi.db
        .query('api::supplier.supplier')
        .findMany({
          where: {
            supplier_attributes: {
              id: supplier_attributes_ids,
            },
          },
          populate: {
            user: POPULATE.user,
          },
        });

      ctx.body = findSuppliers;
    },
  })
);
