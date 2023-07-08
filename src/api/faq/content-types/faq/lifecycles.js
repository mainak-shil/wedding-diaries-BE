module.exports = {
  beforeCreate(event) {
    const { data, where, select, populate } = event.params;
    console.log('event before', event);

    // let's do a 20% discount everytime
    // event.params.data.title = 'someee';
  },

  afterCreate(event) {
    const { result, params } = event;
    console.log('event after', JSON.stringify(event));

    // do something to the result;
  },
};
