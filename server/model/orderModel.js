import { Schema, model } from "mongoose";

const orderSchema = new Schema({
  total_price_set: {
    shop_money: {
      amount: Number,
      currency_code: String,
    },
  },
  created_at: Date,
  customer_id: Schema.Types.ObjectId,
});

export default model("shopifyOrders", orderSchema, "shopifyOrders");
