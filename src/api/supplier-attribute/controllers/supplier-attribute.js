'use strict';
/**
 * supplier-attribute controller
 */

const { ATTRIBUTE_FILTER_TYPES, POPULATE } = require('../../../utils/config');

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController(
  'api::supplier-attribute.supplier-attribute',
  ({ strapi }) => ({
    async postFilterSupplierAttributes(ctx) {
      const { category_id, attributes } = ctx.request.body;

      // 1. find suppliers with category_id: category_id
      const entries = await strapi.db.query('api::supplier.supplier').findMany({
        where: {
          category: {
            id: category_id,
          },
        },
        populate: {
          category: true,
          supplier_attributes: true,
          user: POPULATE.user, //! ***
        },
      });

      const filteredArray = entries.filter(obj => {
        return attributes.every(filter => {
          if (!obj.supplier_attributes.some(attr => attr.id === filter.id)) {
            return false; // Attribute with the specified ID not found
          }

          const attribute = obj.supplier_attributes.find(
            attr => attr.id === filter.id
          );

          if (filter.type === ATTRIBUTE_FILTER_TYPES.MIN_MAX_RANGE) {
            const [minValue, maxValue] = JSON.parse(filter.value); //! user value
            const [attributeMinValue, attributeMaxValue] = JSON.parse(
              attribute.attribute_value
            );
            return (
              minValue >= attributeMinValue && maxValue <= attributeMaxValue
            );
          } else if (filter.type === ATTRIBUTE_FILTER_TYPES.TEXT) {
            const attributeValue = attribute.attribute_value;
            return attributeValue.toLowerCase() === filter.value.toLowerCase();
          }

          return true; // No filter type specified, consider it as a match
        });
      });

      ctx.body = filteredArray;
    },
  })
);
