\c lightbnb;

SELECT
properties.id,
properties.title,
properties.cost_per_night,
avg(property_reviews.rating) as average_rating
FROM
properties
JOIN
property_reviews ON properties.id = property_id
WHERE
city LIKE '%ancouv%'
GROUP BY
properties.id
HAVING
avg(property_reviews.rating) >= 4
ORDER BY
properties.cost_per_night
LIMIT
10;


SELECT
properties.*,
avg(property_reviews.rating) as average_rating
FROM
properties
JOIN
property_reviews ON properties.id = property_id
WHERE
city LIKE '%a%'
AND
cost_per_night >= 40000
GROUP BY
properties.id
ORDER BY
properties.cost_per_night
LIMIT
10
;

SELECT owner_id, COUNT(*) as number_of_listings
FROM properties
GROUP BY owner_id
HAVING COUNT(*) > 4
ORDER BY owner_id DESC;
