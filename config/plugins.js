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
});
