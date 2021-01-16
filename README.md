# discoverybackend
Backend preliminary assignment

## Description
The backend will generate new / popular / nearby restaurant lists from the given data by taking the location of a customer into account.

Backend uses restaurant objects which represent **fictive** restaurants in Helsinki.  Each object has a set of fields providing more information about the restaurant, like *name* and *location*.

Example:
```
{
   "blurhash":"UAPp-JsCNbr[UQagn*V^p-bYjIjtL?kSo]bG",
   "location":[
      24.933257,
      60.171263
   ],
   "name":"Charming Cherry House",
   "online": true,
   "launch_date":"2020-09-20",
   "popularity":0.665082352909038
}
```

### Fields:
- **blurhash**: image representation (type: string)
- **location**: Restaurant's location as latitude and longitude coordinates. First element in the list is the longitude (type: a list containing two decimal elements)
- **name**: The name of the restaurant (type: string)
- **launch_date**: the date when the restaurant was added to Wolt app (type: string, ISO 8601 date)
- **online**: if *true*, the restaurant is accepting orders. If *false*, the restaurant is closed (type: boolean)
- **popularity**: the higher the number, the more popular the restaurant is in Wolt app (type: a float between 0-1, where 1 is the - most popular restaurant)

*restaurants.json* in the repository contains one hundred restaurants from the Helsinki area. 

Backend acts as an **API endpoint** */discovery* that takes coordinates of the customer as an input and then **returns a page (JSON response)** containing *most popular, newest and nearby* restaurants (based on given coordinates). 

Location of a customer needs to be provided as **request parameters** *lat* (latitude) and *lon* (longitude), e.g. */discovery?lat=60.1709&lon=24.941*. Both parameters accept float values.

An JSON object returned by the */discovery* -endpoint must have the following structure:
```
{
   "sections": [
      {
           "title": "Popular Restaurants",
           "restaurants": [.. add max 10 restaurant objects..]
      },
      {
           "title": "New Restaurants",
           "restaurants": [..add max 10 restaurant objects..]
      },
 	{
           "title": "Nearby Restaurants",
           "restaurants": [.. add max 10 restaurant objects..]
      }

   ]
}
```

Each *restaurants*-list has **maximum 10** restaurant objects. A list can also contain fewer restaurants (or even be empty) if there are not enough objects matching given conditions. A section with an empty *restaurants*-list is removed from the response.

There are two main rules that are followed:
- All restaurants returned by the endpoint are **closer than 1.5 kilometers** from given coordinates, measured as a straight line between coordinates and the location of the restaurant.
- Open restaurants (*online=true*) are **more important** than closed ones. Every list is first populated with open restaurants, and only adding closed ones if there is still capacity left.

In addition each list has a specific **sorting rule**:
- “Popular Restaurants”: highest *popularity* value first (descending order)
- “New Restaurants”: Newest *launch_date* first (descending). This list has also a special rule: *launch_date* must be no older than 4 months.
- “Nearby Restaurants”: Closest to the given location first (ascending).

The same restaurant can obviously be in multiple lists (if it matches given criteria).
