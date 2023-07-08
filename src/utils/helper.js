const { ATTRIBUTE_FILTER_TYPES, KM_RANGE_SEARCH } = require('./config');
const csv = require('csv-parser');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');

function calcDistanceInKM(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers

  // Convert latitude and longitude differences from degrees to radians
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  // Haversine formula to calculate the great-circle distance between two points
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Calculate the distance in kilometers
  const distance = R * c;

  // Convert distance to meters and return
  return distance * 1000;
}

// Converts numeric degrees to radians
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function matchAttributesBasedOnTypes(type, user_value, supplier_value) {
  switch (type) {
    case ATTRIBUTE_FILTER_TYPES.MIN_MAX_RANGE:
      const [minValue, maxValue] = JSON.parse(user_value); // Parse user value as [min, max]
      const [attributeMinValue, attributeMaxValue] = JSON.parse(supplier_value); // Parse supplier value as [min, max]
      return minValue >= attributeMinValue && maxValue <= attributeMaxValue; // Check if user range is within supplier range
    case ATTRIBUTE_FILTER_TYPES.TEXT:
      return supplier_value.toLowerCase() === user_value.toLowerCase(); // Compare case-insensitive text values
    case ATTRIBUTE_FILTER_TYPES.LAT_LONG:
      const [userLat, userLng] = JSON.parse(user_value); // Parse user latitude and longitude
      const [lat, lng] = JSON.parse(supplier_value); // Parse supplier latitude and longitude
      const distanceInKM = calcDistanceInKM(userLat, userLng, lat, lng); // Calculate distance in kilometers
      console.log('km', distanceInKM);
      return distanceInKM <= KM_RANGE_SEARCH; // Check if distance is within the desired threshold (1 km in this case)
    default:
      return false; // Default case if type doesn't match any defined cases
  }
}
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sendAck({ ctx, message, statusCode = 200, data }) {
  ctx.send({ message, data }, statusCode);
}

function csvParserAddUser(filePath, userId) {
  const jsonData = [];
  const purgeData = [];
  return new Promise(resolve => {
    fs.createReadStream(filePath)
      .pipe(csv(['name', 'email', 'phone']))
      .on('data', data => {
        if (isValidEmail(data.email) && data.phone.length && data.name.length) {
          jsonData.push({ ...data, user: { id: userId } });
        } else {
          purgeData.push(data);
        }
      })
      .on('end', () => {
        // CSV parsing is complete
        console.log('CSV file read successfully.');
        resolve({ jsonData, purgeData });
      });
  });
}

async function sendMailUsingSendGrid(msg) {
  // const msg = {
  //   to: 'dev.mainakshil@gmail.com', // Change to your recipient
  //   from: 'suraj@alsoltech.com', // Change to your verified sender
  //   subject: 'Sending with SendGrid is Fun',
  //   text: 'and easy to do anywhere, even with Node.js',
  //   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
  // };
  await sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent');
    })
    .catch(error => {
      console.error(JSON.stringify(error));
    });
}

module.exports = {
  calcDistanceInKM,
  matchAttributesBasedOnTypes,
  isValidEmail,
  sendAck,
  csvParserAddUser,
  sendMailUsingSendGrid,
};
