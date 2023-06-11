const ATTRIBUTE_FILTER_TYPES = {
  TEXT: 'Text',
  MIN_MAX_RANGE: '[minValue,maxValue]',
}

const RESPONSE_SELECTION = {
  user: { select: ['id', 'username', 'email'] },
}

module.exports = { ATTRIBUTE_FILTER_TYPES, RESPONSE_SELECTION }
