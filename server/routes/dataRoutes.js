import mongoose from "mongoose";
import express from "express";
import orderModel from "../model/orderModel.js";
import ShopifyCustomer from "../model/customerModel.js";
import ShopifyProduct from "../model/productModel.js";

const router = express.Router();

// Total Sales Over Time
router.get("/total-sales", async (req, res) => {
  try {
    const interval = req.query.interval || "daily"; // Can be 'daily', 'monthly', 'quarterly', 'yearly'

    let groupBy;
    switch (interval) {
      case "daily":
        groupBy = {
          $dateToString: {
            format: "%Y-%m-%d",
            date: { $dateFromString: { dateString: "$created_at" } },
          },
        };
        break;
      case "monthly":
        groupBy = {
          $dateToString: {
            format: "%Y-%m",
            date: { $dateFromString: { dateString: "$created_at" } },
          },
        };
        break;
      case "quarterly":
        groupBy = {
          $concat: [
            {
              $dateToString: {
                format: "%Y",
                date: { $dateFromString: { dateString: "$created_at" } },
              },
            },
            "-Q",
            {
              $ceil: {
                $divide: [
                  {
                    $month: { $dateFromString: { dateString: "$created_at" } },
                  },
                  3,
                ],
              },
            },
          ],
        };
        break;
      case "yearly":
        groupBy = {
          $dateToString: {
            format: "%Y",
            date: { $dateFromString: { dateString: "$created_at" } },
          },
        };
        break;
      default:
        return res.status(400).json({ error: "Invalid interval specified" });
    }

    const salesData = await orderModel.aggregate([
      {
        $group: {
          _id: groupBy,
          totalSales: {
            $sum: { $toDouble: "$total_price_set.shop_money.amount" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    res.json(salesData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/sales-growth-rate", async (req, res) => {
  try {
    const interval = req.query.interval || "monthly"; // Can be 'daily', 'monthly', 'quarterly', 'yearly'

    let groupBy;
    switch (interval) {
      case "daily":
        groupBy = {
          $dateToString: {
            format: "%Y-%m-%d",
            date: { $dateFromString: { dateString: "$created_at" } },
          },
        };
        break;
      case "monthly":
        groupBy = {
          $dateToString: {
            format: "%Y-%m",
            date: { $dateFromString: { dateString: "$created_at" } },
          },
        };
        break;
      case "quarterly":
        groupBy = {
          $concat: [
            {
              $dateToString: {
                format: "%Y",
                date: { $dateFromString: { dateString: "$created_at" } },
              },
            },
            "-Q",
            {
              $ceil: {
                $divide: [
                  {
                    $month: { $dateFromString: { dateString: "$created_at" } },
                  },
                  3,
                ],
              },
            },
          ],
        };
        break;
      case "yearly":
        groupBy = {
          $dateToString: {
            format: "%Y",
            date: { $dateFromString: { dateString: "$created_at" } },
          },
        };
        break;
      default:
        return res.status(400).json({ error: "Invalid interval specified" });
    }

    // First, calculate the total sales for each period
    const salesData = await orderModel.aggregate([
      {
        $group: {
          _id: groupBy,
          totalSales: {
            $sum: { $toDouble: "$total_price_set.shop_money.amount" },
          },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Calculate the growth rate
    const growthRateData = salesData.map((current, index, array) => {
      if (index === 0) {
        // First period has no previous period to compare, so growth rate is undefined or 0
        return {
          period: current._id,
          totalSales: current.totalSales,
          growthRate: null,
        };
      } else {
        const previous = array[index - 1];
        const growthRate =
          ((current.totalSales - previous.totalSales) / previous.totalSales) *
          100;

        return {
          period: current._id,
          totalSales: current.totalSales,
          growthRate: growthRate.toFixed(2), // Round to 2 decimal places
        };
      }
    });

    res.json(growthRateData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
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
        { $toString: { $ceil: { $divide: [{ $month: "$created_at" }, 3] } } },
      ],
    },
    yearly: { $dateToString: { format: "%Y", date: "$created_at" } },
  };

  if (!groupBy[interval]) {
    return res.status(400).json({ error: "Invalid interval specified." });
  }

  try {
    const repeatCustomers = await orderModel.aggregate([
      // Stage 1: Convert created_at to a date if necessary
      { $addFields: { created_at: { $toDate: "$created_at" } } },

      // Stage 2: Group by customer_id and the selected interval to count purchases
      {
        $group: {
          _id: { customer_id: "$customer_id", date: groupBy[interval] },
          orderCount: { $sum: 1 },
        },
      },

      // Stage 3: Filter to find customers who made more than one purchase in that interval
      { $match: { orderCount: { $gt: 1 } } },

      // Stage 4: Group by the interval date and count how many customers are repeat customers
      {
        $group: {
          _id: "$_id.date",
          repeatCustomers: { $sum: 1 },
        },
      },

      // Stage 5: Sort by the interval date
      { $sort: { _id: 1 } },
    ]);

    res.json(repeatCustomers);
  } catch (error) {
    console.error(error);
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
    // Step 1: Aggregate customers to get their first purchase month and total spent
    const cohorts = await ShopifyCustomer.aggregate([
      // Step 1: Lookup orders related to each customer
      {
        $lookup: {
          from: "shopifyOrders", // Replace with your orders collection name
          localField: "id", // Assuming 'id' is the customer identifier
          foreignField: "customer_id",
          as: "shopifyOrders",
        },
      },
      // Step 2: Filter customers who have made at least one order
      {
        $match: {
          orders: { $ne: [] },
        },
      },
      // Step 3: Unwind the orders array
      {
        $unwind: "$orders",
      },
      // Step 4: Sort orders by created_at to find the first purchase
      {
        $sort: {
          "orders.created_at": 1,
        },
      },
      // Step 5: Group by customer ID to calculate first purchase month and total spent
      {
        $group: {
          _id: "$id",
          firstPurchaseMonth: {
            $first: {
              $dateToString: {
                format: "%Y-%m",
                date: "$orders.created_at",
              },
            },
          },
          totalSpent: { $sum: "$orders.total_amount" }, // Adjust field name as needed
        },
      },
      // Step 6: Group by first purchase month to calculate cohort lifetime value and count
      {
        $group: {
          _id: "$firstPurchaseMonth",
          totalLifetimeValue: { $sum: "$totalSpent" },
          customersCount: { $sum: 1 },
        },
      },
      // Step 7: Calculate the average CLTV per cohort
      {
        $project: {
          cohortMonth: "$_id",
          averageCLTV: { $divide: ["$totalLifetimeValue", "$customersCount"] },
          _id: 0,
        },
      },
      // Step 8: Sort by cohort month
      {
        $sort: { cohortMonth: 1 },
      },
    ]);

    res.json(cohorts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
