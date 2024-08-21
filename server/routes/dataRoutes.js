import mongoose from "mongoose";
import express from "express";
import orderModel from "../model/orderModel.js";
import ShopifyCustomer from "../model/customerModel.js";
import ShopifyProduct from "../model/productModel.js";

const router = express.Router();

// Total Sales Over Time
router.get("/total-sales", async (req, res) => {
  const { interval } = req.query; // interval can be daily, monthly, quarterly, yearly

  // Grouping criteria based on the interval
  const groupBy = {
    daily: { $dateToString: { format: "%Y-%m-%d", date: "$created_at_date" } },
    monthly: { $dateToString: { format: "%Y-%m", date: "$created_at_date" } },
    quarterly: { $dateToString: { format: "%Y-Q", date: "$created_at_date" } },
    yearly: { $dateToString: { format: "%Y", date: "$created_at_date" } },
  };

  try {
    const sales = await orderModel.aggregate([
      // Convert 'created_at' to a date
      {
        $addFields: {
          created_at_date: { $toDate: "$created_at" },
        },
      },
      // Group by the interval
      {
        $group: {
          _id: groupBy[interval],
          totalSales: { $sum: "$total_price_set.shop_money.amount" },
        },
      },
      // Sort by the group key (_id)
      { $sort: { _id: 1 } },
    ]);

    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/data", async (req, res) => {
  //   console.log(req.body);
  try {
    const dd = await ShopifyProduct.create(req.body);

    return res.json({ data: dd, message: "data comming" });
  } catch (error) {
    console.log(error);
    return res.json({ message: error });
  }
});
router.get("/data", async (req, res) => {
  try {
    const dd = await orderModel.find();

    return res.json({ data: dd, message: "data comming" });
  } catch (error) {
    console.log(error);
    return res.json({ message: error });
  }
});
router.get("/sales-growth-rate", async (req, res) => {
  // Similar to the total sales but compute growth rate between intervals
});

// New Customers Added Over Time
router.get("/new-customers", async (req, res) => {
  const { interval } = req.query;
  console.log(interval);
  const groupBy = {
    daily: { $dateToString: { format: "%Y-%m-%d", date: "$created_at_date" } },
    monthly: { $dateToString: { format: "%Y-%m", date: "$created_at_date" } },
    quarterly: { $dateToString: { format: "%Y-Q", date: "$created_at_date" } },
    yearly: { $dateToString: { format: "%Y", date: "$created_at_date" } },
  };

  try {
    const newCustomers = await ShopifyCustomer.aggregate([
      {
        $addFields: {
          created_at_date: { $toDate: "$created_at" },
        },
      },
      {
        $group: {
          _id: groupBy[interval],
          newCustomers: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(newCustomers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Number of Repeat Customers
router.get("/repeat-customers", async (req, res) => {
  const { interval } = req.query;
  const groupBy = {
    daily: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
    monthly: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
    quarterly: { $dateToString: { format: "%Y-Q", date: "$created_at" } },
    yearly: { $dateToString: { format: "%Y", date: "$created_at" } },
  };

  try {
    const repeatCustomers = await orderModel.aggregate([
      { $group: { _id: "$customer_id", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
      { $group: { _id: groupBy[interval], repeatCustomers: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(repeatCustomers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Geographical Distribution of Customers
router.get("/geographical-distribution", async (req, res) => {
  try {
    const distribution = await ShopifyCustomer.aggregate([
      { $group: { _id: "$default_address.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json(distribution);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Customer Lifetime Value by Cohorts
router.get("/customer-lifetime-value", async (req, res) => {
  try {
    const cohorts = await orderModel.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$created_at" },
            customer_id: "$customer_id",
          },
          totalSpent: { $sum: "$total_price_set.shop_money.amount" },
        },
      },
      { $group: { _id: "$_id.month", lifetimeValue: { $avg: "$totalSpent" } } },
      { $sort: { _id: 1 } },
    ]);
    res.json(cohorts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
