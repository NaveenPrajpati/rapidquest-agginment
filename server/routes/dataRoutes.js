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

  // Define the correct format for each interval
  const groupBy = {
    daily: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
    monthly: { $dateToString: { format: "%Y-%m", date: "$created_at" } },
    quarterly: {
      $concat: [
        { $toString: { $year: "$created_at" } },
        "-Q",
        {
          $toString: {
            $ceil: { $divide: [{ $month: "$created_at" }, 3] },
          },
        },
      ],
    },
    yearly: { $dateToString: { format: "%Y", date: "$created_at" } },
  };

  if (!groupBy[interval]) {
    return res.status(400).json({ error: "Invalid interval specified." });
  }

  try {
    const repeatCustomers = await orderModel.aggregate([
      // Stage 1: Convert created_at to date if necessary
      { $addFields: { created_at: { $toDate: "$created_at" } } },

      // Stage 2: Group by customer_id and created_at according to the interval
      {
        $group: {
          _id: { customer_id: "$customer_id", date: groupBy[interval] },
          count: { $sum: 1 },
        },
      },

      // Stage 3: Filter customers who have made more than one purchase in that interval
      { $match: { count: { $gt: 1 } } },

      // Stage 4: Group by the date part of the interval and count the number of repeat customers
      { $group: { _id: "$_id.date", repeatCustomers: { $sum: 1 } } },

      // Stage 5: Sort by the interval date
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
    // Step 1: Aggregate customers to get their first purchase month
    const cohorts = await ShopifyCustomer.aggregate([
      {
        $lookup: {
          from: "orders", // Replace with your orders collection name
          localField: "id", // Assuming 'id' is the customer identifier
          foreignField: "customer_id",
          as: "orders",
        },
      },
      {
        $unwind: "$orders",
      },
      {
        $sort: {
          "orders.created_at": 1,
        },
      },
      {
        $group: {
          _id: "$id",
          firstPurchaseMonth: {
            $dateToString: {
              format: "%Y-%m",
              date: { $arrayElemAt: ["$orders.created_at", 0] },
            },
          },
          totalSpent: { $sum: "$orders.total_amount" }, // Adjust field name as needed
        },
      },
      {
        $group: {
          _id: "$firstPurchaseMonth",
          totalLifetimeValue: { $sum: "$totalSpent" },
          customersCount: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json(cohorts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
