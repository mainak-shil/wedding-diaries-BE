import favicon from './extensions/favicon.ico';

const config = {
  translations: {
    en: {
      'Auth.form.welcome.title': 'Welcome to Wedding Diaries',
      'Auth.form.welcome.subtitle': 'Log in to your account',
      'app.components.LeftMenu.navbrand.title': 'Dashboard',
    },
  },
  head: {
    favicon,
  },
};

const bootstrap = app => {
  console.log('bootstrap', app);
};

export default {
  config,
  bootstrap,
};
