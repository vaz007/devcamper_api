const advancedResults = (model, populate) => async (req, res, next) => {
  let query;
  // req.query will get query from the url string
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];
  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);
  // console.log(reqQuery);

  // Create query String
  let queryStr = JSON.stringify(reqQuery);

  // Create Operators ($gt, $gte, etc read mongoos docs for more info)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);
  // console.log(queryStr)

  // Finding resource
  // populate is basically merging two schemas
  // more like join in sql
  query = model.find(JSON.parse(queryStr));

  // Select fields
  // just to retrive particular fields instead of entire object
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query.sort("-createdAt");
  }
  // Pagination
  // good for fetching small amounts of data
  // but if we use cache system then we wont need this
  const page = parseInt(req.query.page, 10 || 1);
  const limit = parseInt(req.query.limit, 10 || 1);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const skip = (page - 1) * limit;
  const total = await model.countDocuments();
  query = query.skip(skip).limit(limit);

  if (populate) {
    query = query.populate(populate);
  }

  // Execute query
  const results = await query;
  // Pagination result
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

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};
module.exports = advancedResults;
