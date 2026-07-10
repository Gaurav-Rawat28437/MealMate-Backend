const express = require("express");
const cors = require("cors");

const restaurantsData = require("./data/restaurants.json");
const menuCardsData = require("./data/menuCards.json");
const foodCategoriesData = require("./data/foodCategories.json");
const foodItemsData = require("./data/foodItems.json");

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

const PORT = process.env.PORT || 8080;

const getArrayData = (data, key) => {
  if (Array.isArray(data)) {
    return data;
  }

  return data[key] || [];
};

const restaurants = getArrayData(restaurantsData, "restaurants");
const menuCards = getArrayData(menuCardsData, "menuCards");
const foodCategories = getArrayData(foodCategoriesData, "foodCategories");
const foodItems = getArrayData(foodItemsData, "foodItems");

app.get("/", (req, res) => {
  res.send("MealMate backend is running");
});

app.get("/foodCategories", (req, res) => {
  res.json(foodCategories);
});

app.get("/foodItems", (req, res) => {
  res.json(foodItems);
});

app.get("/restaurants", (req, res) => {
  const { foodCategoryId, city, limit, sort, minRating, page } = req.query;

  let filteredRestaurants = restaurants;

  // filter by city
  if (city) {
    filteredRestaurants = filteredRestaurants.filter((restaurant) => {
      const restaurantCity = restaurant.restaurantInfo?.cityName?.toLowerCase();
      return restaurantCity === city.toLowerCase();
    });
  }

  // filter by food category
  if (foodCategoryId) {
    filteredRestaurants = filteredRestaurants.filter(
      (restaurant) => restaurant.foodCategoryId === foodCategoryId
    );
  }

  // filter rating greater than or equal to minRating
  if (minRating) {
    filteredRestaurants = filteredRestaurants.filter((restaurant) => {
      const rating = Number(restaurant.restaurantInfo?.avgRating || 0);
      return rating >= Number(minRating);
    });
  }

  // sort by rating high to low
  if (sort === "highRating") {
    filteredRestaurants = [...filteredRestaurants].sort((a, b) => {
      const ratingA = Number(a.restaurantInfo?.avgRating || 0);
      const ratingB = Number(b.restaurantInfo?.avgRating || 0);

      return ratingB - ratingA;
    });
  }

  // sort by rating low to high 
  if (sort === "lowRating") {
    filteredRestaurants = [...filteredRestaurants].sort((a, b) => {
      const ratingA = Number(a.restaurantInfo?.avgRating || 0);
      const ratingB = Number(b.restaurantInfo?.avgRating || 0);

      return ratingA - ratingB;
    });
  }

  const totalRestaurants = filteredRestaurants.length;

  if (page && limit) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const startIndex = (pageNumber - 1) * limitNumber;
    const endIndex = startIndex + limitNumber;

    const paginatedData = filteredRestaurants.slice(startIndex, endIndex);

    return res.json({
      data: paginatedData,
      currentPage: pageNumber,
      totalRestaurants,
      hasMore: endIndex < totalRestaurants,
    })}

  res.json(filteredRestaurants);
});

app.get("/restaurants/:restaurantId", (req, res) => {
  const { restaurantId } = req.params;

  const restaurant = restaurants.find(
    (item) => item.restaurantId === restaurantId
  );

  if (!restaurant) {
    return res.status(404).json({
      message: "Restaurant not found",
    });
  }

  res.json(restaurant);
});

app.get("/menuCards", (req, res) => {
  const { restaurantId } = req.query;

  if (!restaurantId) {
    return res.status(400).json({
      message: "restaurantId is required",
    });
  }

  const filteredMenuCards = menuCards.filter(
    (item) => item.restaurantId === restaurantId
  );

  res.json(filteredMenuCards);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});