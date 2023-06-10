const config = {
  translations: {
    en: {
      "Auth.form.welcome.title": "Welcome to Wedding-app",
      "Auth.form.welcome.subtitle": "Log in to your account",
      "app.components.LeftMenu.navbrand.title": "Dashboard",
    },
  },
};

const bootstrap = (app) => {
  console.log("bootstrap", app);
};

export default {
  config,
  bootstrap,
};
