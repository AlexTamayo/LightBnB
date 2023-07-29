const properties = require("./json/properties.json");
const users = require("./json/users.json");

const { Pool } = require('pg');

const pool = new Pool({
  user: 'labber',
  password: 'labber',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
// const getUserWithEmail = function (email) {
//   let resolvedUser = null;
//   for (const userId in users) {
//     const user = users[userId];
//     if (user?.email.toLowerCase() === email?.toLowerCase()) {
//       resolvedUser = user;
//     }
//   }
//   return Promise.resolve(resolvedUser);
// };

const getUserWithEmail = function (email) {
  const queryStr = `
  SELECT *
  FROM
    users
  WHERE
    email = $1;    
  `;

  const values = [email];

  return pool
  .query(queryStr, values)
  .then(result => {
    if (!result.rows[0]) return null;
    return result.rows[0]
  })
  .catch(err => console.log(err.message)) 
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
// const getUserWithId = function (id) {
//   return Promise.resolve(users[id]);
// };

const getUserWithId = function (id) {
  const queryStr = `
  SELECT *
  FROM
    users
  WHERE
    id = $1;    
  `;

  const values = [id];

  return pool
  .query(queryStr, values)
  .then(result => {
    if (!result.rows[0]) return null;
    return result.rows[0]
  })
  .catch(err => console.log(err.message)) 
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
// const addUser = function (user) {
//   const userId = Object.keys(users).length + 1;
//   user.id = userId;
//   users[userId] = user;
//   return Promise.resolve(user);
// };

const addUser = function (user) {

  const queryStr = `
  INSERT INTO
    users (name, email, password)
  VALUES
    ($1, $2, $3)
  RETURNING *;
  `;

  const values = [user.name, user.email, user.password];

  return pool
  .query(queryStr, values)
  .then(result => result.rows[0])
  .catch(err => console.log(err.message)) 
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
// const getAllReservations = function (guest_id, limit = 10) {
//   return getAllProperties(null, 2);
// };
const getAllReservations = function (guest_id, limit = 10) {

  const queryStr = `
  SELECT
    properties.*,
    avg(property_reviews.rating) as average_rating
  FROM
    reservations
  JOIN
    properties ON properties.id = reservations.property_id
  JOIN
    property_reviews ON properties.id = property_reviews.property_id
  WHERE
    reservations.guest_id = $1
  GROUP BY
    properties.id,
    reservations.start_date
  ORDER BY
    reservations.start_date
  LIMIT
  $2;
  `;

  const values = [850, limit];

  // const values = [guest_id, limit];

  return pool
  .query(queryStr, values)
  .then(result => result.rows)
  .catch(err => console.log(err.message))

};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
// const getAllProperties = function (options, limit = 10) {
//   const limitedProperties = {};
//   for (let i = 1; i <= limit; i++) {
//     limitedProperties[i] = properties[i];
//   }
//   return Promise.resolve(limitedProperties);
// };
const getAllProperties = (options, limit = 10) => {

  const queryParams = [];

  let queryStr = `
  SELECT
    properties.*,
    avg(property_reviews.rating) as average_rating
  FROM
    properties
  JOIN
    property_reviews ON properties.id = property_id
  `;

  const whereClauses = [];

  //  owner_id | number_of_listings 
  // ----------+--------------------
  //     850   |         5
  //     818   |         5
  //     654   |         5
  //     617   |         5
  //     401   |         5

  if (options.owner_id) {
    // queryParams.push(`${options.owner_id}`);
    queryParams.push(850);
    whereClauses.push(`properties.owner_id = $${queryParams.length}`);
  }

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    whereClauses.push(`city LIKE $${queryParams.length}`);
  }

  if (options.minimum_price_per_night) {
    queryParams.push(`${options.minimum_price_per_night*100}`);
    whereClauses.push(`cost_per_night >= $${queryParams.length}`);
  }
  
  if (options.maximum_price_per_night) {
    queryParams.push(`${options.maximum_price_per_night*100}`);
    whereClauses.push(`cost_per_night <= $${queryParams.length}`);
  }

  if(whereClauses.length > 0) {
    queryStr += ' WHERE ' + whereClauses.join(' AND ');
  }

  queryStr += `
  GROUP BY
    properties.id
  `;

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryStr += `HAVING avg(property_reviews.rating) >= $${queryParams.length}`;

  }

  queryParams.push(`${limit}`);
  queryStr += `
  ORDER BY
    cost_per_night
  LIMIT
    $${queryParams.length};
  `;

  // console.log(queryStr, queryParams);

  return pool
    .query(queryStr, queryParams)
    .then(result => {
      // console.log(result);
      // console.log(result.rows);
      return result.rows})
    .catch(err => console.log(err.message));
};


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
