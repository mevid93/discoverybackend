const express = require('express')
const cors = require('cors')
const app = express()
const restaurantService = require('./services/restaurantService')

// apply middlewares
app.use(cors())
app.use(express.json())
app.use(express.static('build'))


// API ENDPOINT: get the restaurant lists
app.get('/discovery', (req, res) => {

  // get latitude and longitude from query
  let lat = req.query.lat || undefined
  let lon = req.query.lon || undefined

  // if latitude or longitude not provided --> bad query
  if (lat === undefined || lon === undefined) {
    return res.status(400).json({ error: "lat or lon missing" })
  }

  lat = parseFloat(lat)
  lon = parseFloat(lon)
  // if latituder and longitude provided, but they are not floats
  if (lat === undefined || lon === undefined) {
    return res.status(400).json({ error: "lat and lon must be floats" })
  }

  // create response json containing restaurants
  const restaurantsObj = { sections: [] }
  const popularRestaurants = restaurantService.findPopularRestaurants(lat, lon)
  const newRestaurants = restaurantService.findNewRestaurants(lat, lon)
  const nearbyRestaurants = restaurantService.findNearbyRestaurants(lat, lon)

  // if popular restaurants --> add them to list
  if (popularRestaurants.length !== 0) {
    const popularRestaurantsObj = {
      title: 'Popular Restaurants',
      restaurants: popularRestaurants
    }
    restaurantsObj.sections.push(popularRestaurantsObj)
  }

  // if new restaurants --> add them to list
  if (newRestaurants.length !== 0) {
    const newRestaurantsObj = {
      title: 'New Restaurants',
      restaurants: newRestaurants
    }
    restaurantsObj.sections.push(newRestaurantsObj)
  }

  // if nearby restaurants --> add them to list
  if (nearbyRestaurants.length !== 0) {
    const nearbyRestaurantsObj = {
      title: 'Nearby Restaurants',
      restaurants: nearbyRestaurants
    }
    restaurantsObj.sections.push(nearbyRestaurantsObj)
  }

  res.status(200).json(restaurantsObj)
});


// define port and start the application
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
