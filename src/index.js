'use strict';
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
const path = require('path');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {
    dotenv.config({
      path:
        process.env.NODE_ENV === 'LOCAL'
          ? path.join(process.cwd(), '.env.local')
          : process.env.NODE_ENV === 'DEV'
          ? path.join(process.cwd(), '.env.dev')
          : path.join(process.cwd(), '.env.prod'),
    });
  },

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap(/*{ strapi }*/) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  },
};
