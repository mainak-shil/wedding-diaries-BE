const ATTRIBUTE_FILTER_TYPES = {
  TEXT: 'Text',
  MIN_MAX_RANGE: '[minValue,maxValue]',
  LAT_LONG: '[Lat,Lng]',
};

const POPULATE = {
  user: { populate: ['user_image', 'address'] },
};
const SELECT = {
  user: { select: ['id', 'username', 'email', 'name'] },
};

const KM_RANGE_SEARCH = 10;

module.exports = { ATTRIBUTE_FILTER_TYPES, POPULATE, KM_RANGE_SEARCH, SELECT };
