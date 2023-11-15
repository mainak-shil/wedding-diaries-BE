import type { Schema, Attribute } from '@strapi/strapi';

export interface LocationLocation extends Schema.Component {
  collectionName: 'components_location_locations';
  info: {
    displayName: 'Location';
  };
  attributes: {
    address: Attribute.String;
    latitude: Attribute.String;
    longitude: Attribute.String;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'location.location': LocationLocation;
    }
  }
}
