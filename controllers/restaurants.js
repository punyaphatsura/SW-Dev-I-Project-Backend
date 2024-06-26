import Restaurant from "../models/Restaurant.js";

//@desc     Get all restaurant
//@route    Get /api/v1/restaurant
//@access   Public
export const getRestaurants = async (req, res, next) => {
  let query;

  //copy req.query
  const reqQuery = { ...req.query };

  //Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  //Loop over remove fields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);
  console.log(reqQuery);

  let queryStr = JSON.stringify(req.query);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  query = Restaurant.find(JSON.parse(queryStr));

  //select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  //sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  //pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const total = await Restaurant.countDocuments();
    query = query.skip(startIndex).limit(limit);

    //Execute query
    const restaurants = await query;

    //Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }
    res.status(200).json({
      success: true,
      count: restaurants.length,
      pagination,
      data: restaurants,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
};

//@desc     Get single restaurant
//@route    Get /api/v1/restaurants/:id
//@access   Public
export const getRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    console.log(req.params.id);
    if (!restaurant) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: restaurant });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
};

//@desc     Create new restaurants
//@route    Post /api/v1/restaurants
//@access   Private
export const createRestaurant = async (req, res, next) => {
  try {
    console.log(req.body);
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error(error);
  }
};

//@desc     Update Restaurants
//@route    PUT /api/v1/restaurants/:id
//@access   Private
export const updateRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!restaurant) {
      return res.status(400).json({ success: false });
    }
    res.status(200).json({ success: true, data: restaurant });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
};

//@desc     Delete restaurants
//@route    DELETE /api/v1/restaurants/:id
//@access   Private
export const deleteRestaurant = async (req, res, next) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    console.log(restaurant);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: `Bootcamp not found with id of ${req.params.id}`,
      });
    }

    await restaurant.deleteOne();
    console.log("deleted");
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false });
  }
};
