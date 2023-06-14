const ATTRIBUTE_FILTER_TYPES = {
  TEXT: 'Text',
  MIN_MAX_RANGE: '[minValue,maxValue]',
  LAT_LONG: '[Lat,Lng]',
};

const POPULATE = {
  user: { select: ['id', 'username', 'email'] },
};

module.exports = { ATTRIBUTE_FILTER_TYPES, POPULATE };
