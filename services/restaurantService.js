const restaurantsObj = require('./restaurants.json')
const restaurants = restaurantsObj.restaurants

// https://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
function distance(lat1, lon1, lat2, lon2) {
  var p = 0.017453292519943295;
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p) / 2 +
    c(lat1 * p) * c(lat2 * p) *
    (1 - c((lon2 - lon1) * p)) / 2;
  return 12742 * Math.asin(Math.sqrt(a));
}

// function to remove properties properties that api should not return
const filterUnusedProperties = (finalRestaurants) => {
  finalRestaurants.forEach(r => {
    delete r.distance
    delete r.age
  })
  return finalRestaurants
}

// find restaurants by using the two main rules:
// 1. restaurants must be within 1.5 km
// 2. open restaurants are more important than closed ones
// + add distance property
const findRestaurants = (lat, lon) => {
  let filteredRestaurants = { open: [], closed: [] }
  filteredRestaurants.open = restaurants.filter(r => {
    if (r.online !== true) return false
    r.distance = distance(lat, lon, r.location[1], r.location[0])
    if (r.distance < 1.5) return true
    return false
  })
  filteredRestaurants.closed = restaurants.filter(r => {
    if (r.online === true) return false
    r.distance = distance(lat, lon, r.location[1], r.location[0])
    if (r.distance < 1.5) return true
    return false
  })
  return filteredRestaurants
}

// function to find popular restaurants
const findPopularRestaurants = (lat, lon) => {
  let validRestaurants = findRestaurants(lat, lon)
  let popularRestaurants = validRestaurants.open.sort((a, b) => b.popularity - a.popularity)
  popularRestaurants = popularRestaurants.slice(0, 10)
  // if less than 10 open restaurants, add closed restaurants
  if (popularRestaurants.length < 10) {
    const popularClosedRestaurants = validRestaurants.closed.sort((a, b) => b.popularity - a.popularity)
    for (let i = 0; i < popularClosedRestaurants.length; i++) {
      popularRestaurants.push(popularClosedRestaurants[i])
      if (popularRestaurants.length >= 10) break
    }
  }
  return filterUnusedProperties(popularRestaurants)
}

// function that filters away restaurants with
// launch date older than 4 months
// + add age property
const filterOldRestaurants = (restaurantList) => {
  const currentDate = new Date()
  const filteredRestaurants = restaurantList.filter(r => {
    const launchDate = new Date(r.launch_date)
    const diffTime = Math.abs(currentDate - launchDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    r.age = diffDays
    return diffDays <= 4 * 30 ? true : false
  })
  return filteredRestaurants
}

// function to find new resturants
const findNewRestaurants = (lat, lon) => {
  let validRestaurants = findRestaurants(lat, lon)
  // use special rule: restaurant cannot be older than 4 month
  validRestaurants.open = filterOldRestaurants(validRestaurants.open)
  validRestaurants.open = validRestaurants.open.sort((a, b) => a.age - b.age)
  let newRestaurants = validRestaurants.open.slice(0, 10)
  // if less than 10 open restaurants, add closed restaurants
  if (newRestaurants.length < 10) {
    validRestaurants.closed = filterOldRestaurants(validRestaurants.closed)
    validRestaurants.closed = validRestaurants.closed.sort((a, b) => a.age - b.age)
    for (let i = 0; i < validRestaurants.closed.length; i++) {
      newRestaurants.push(validRestaurants.closed[i])
      if (newRestaurants.length >= 10) break
    }
  }
  return filterUnusedProperties(newRestaurants)
}

// function to find nearby restaurants
const findNearbyRestaurants = (lat, lon) => {
  let validRestaurants = findRestaurants(lat, lon)
  let nearbyRestaurants = validRestaurants.open.sort((a, b) => a.distance - b.distance)
  nearbyRestaurants = nearbyRestaurants.slice(0, 10)
  // if less than 10 open restaurants, add closed restaurants
  if (nearbyRestaurants.length < 10) {
    const nearbyClosedRestaurants = validRestaurants.closed.sort((a, b) => a.distance - b.distance)
    for (let i = 0; i < nearbyClosedRestaurants.length; i++) {
      nearbyRestaurants.push(nearbyClosedRestaurants[i])
      if (nearbyRestaurants.length >= 10) break
    }
  }
  return filterUnusedProperties(nearbyRestaurants)
}

exports.findPopularRestaurants = findPopularRestaurants
exports.findNewRestaurants = findNewRestaurants
exports.findNearbyRestaurants = findNearbyRestaurants