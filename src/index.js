'use strict';
const sgMail = require('@sendgrid/mail');
const dotenv = require('dotenv');
const path = require('path');

module.exports = {
  register() {
    dotenv.config({
      path:
        process.env.NODE_ENV === 'LOCAL'
          ? path.join(process.cwd(), '.env.local')
          : process.env.NODE_ENV === 'DEV'
          ? path.join(process.cwd(), '.env.dev')
          : path.join(process.cwd(), '.env.prod'),
    });
  },
  bootstrap() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  },
};
