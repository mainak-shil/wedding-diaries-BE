const { ATTRIBUTE_FILTER_TYPES, KM_RANGE_SEARCH } = require('./config');
const csv = require('csv-parser');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');

function calcDistanceInKM(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance * 1000;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function matchAttributesBasedOnTypes(type, user_value, supplier_value) {
  switch (type) {
    case ATTRIBUTE_FILTER_TYPES.MIN_MAX_RANGE:
      const [minValue, maxValue] = JSON.parse(user_value);
      const [attributeMinValue, attributeMaxValue] = JSON.parse(supplier_value);
      return minValue >= attributeMinValue && maxValue <= attributeMaxValue;
    case ATTRIBUTE_FILTER_TYPES.TEXT:
      return supplier_value.toLowerCase() === user_value.toLowerCase();
    default:
      return false;
  }
}
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isUserInRange(user_value, supplier_value) {
  const [userLat, userLng] = user_value || [];
  const [lat, lng] = supplier_value || [];
  if (!userLat || !userLng || !lat || !lng) {
    return false;
  }
  const distanceInKM = calcDistanceInKM(
    parseFloat(userLat),
    parseFloat(userLng),
    parseFloat(lat),
    parseFloat(lng)
  );
  return distanceInKM <= KM_RANGE_SEARCH;
}

function sendAck({ ctx, message, statusCode = 200, data }) {
  ctx.send({ message, data }, statusCode);
}

function csvParserAddUser(filePath, userId) {
  const jsonData = [];
  const purgeData = [];
  return new Promise(resolve => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', data => {
        if (isValidEmail(data.email) && data.phone.length && data.name.length) {
          jsonData.push({ ...data, user: { id: userId } });
        } else {
          purgeData.push(data);
        }
      })
      .on('end', () => {
        resolve({ jsonData, purgeData });
      });
  });
}

async function sendMailUsingSendGrid(msg) {
  await sgMail
    .send(msg)
    .then(() => {})
    .catch(error => {
      console.error(JSON.stringify(error));
    });
}

function splitToMonthAndWeek(number) {
  number = String(number)?.split('.');
  return { month: number[0], week: number[1] || 0 };
}

module.exports = {
  calcDistanceInKM,
  matchAttributesBasedOnTypes,
  isValidEmail,
  sendAck,
  csvParserAddUser,
  sendMailUsingSendGrid,
  isUserInRange,
  splitToMonthAndWeek,
};
