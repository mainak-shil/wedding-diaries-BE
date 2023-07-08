module.exports = ({ env }) => ({
  upload: {
    config: {
      providerOptions: {
        localServer: {
          maxage: 300000, //Browser cache max-age in milliseconds. defaults to 0 https://github.com/koajs/static
        },
      },
    },
  },
  email: {
    config: {
      provider: 'sendgrid', // For community providers pass the full package name (e.g. provider: 'strapi-provider-email-mandrill')
      providerOptions: {
        apiKey: env('SENDGRID_API_KEY'),
      },
      settings: {
        // defaultFrom: 'juliasedefdjian@strapi.io',
        defaultFrom: 'suraj@alsoltech.com',
        defaultReplyTo: 'suraj@alsoltech.com',
        testAddress: 'dev.mainakshil@gmail.com',
      },
    },
  },
});
