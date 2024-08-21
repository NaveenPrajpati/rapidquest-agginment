import mongoose, { model } from "mongoose";

const { Schema } = mongoose;

// Option sub-schema
const optionSchema = new Schema({
  id: { type: Number, required: true },
  product_id: { type: Number, required: true },
  name: { type: String },
  position: { type: Number },
  values: { type: [String] },
});

// Variant sub-schema
const variantSchema = new Schema({
  id: { type: Number, required: true },
  product_id: { type: Number, required: true },
  title: { type: String },
  price: { type: Number },
  sku: { type: String, default: "" },
  position: { type: Number },
  inventory_policy: { type: String },
  compare_at_price: { type: Number, default: null },
  fulfillment_service: { type: String },
  inventory_management: { type: String, default: null },
  option1: { type: String },
  option2: { type: String, default: null },
  option3: { type: String, default: null },
  created_at: { type: Date, default: null },
  updated_at: { type: Date, default: null },
  taxable: { type: Boolean, default: true },
  barcode: { type: String, default: null },
  grams: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  weight_unit: { type: String, default: "kg" },
  inventory_item_id: { type: Number },
  inventory_quantity: { type: Number, default: 0 },
  old_inventory_quantity: { type: Number, default: 0 },
  requires_shipping: { type: Boolean, default: true },
  admin_graphql_api_id: { type: String },
  image_id: { type: Number, default: null },
});

// Main ShopifyProduct schema
const shopifyProductSchema = new Schema({
  _id: { type: Number, required: true },
  admin_graphql_api_id: { type: String },
  body_html: { type: String, default: null },
  created_at: { type: Date },
  handle: { type: String },
  id: { type: Number, required: true },
  image: { type: Schema.Types.Mixed, default: null },
  images: { type: [Schema.Types.Mixed], default: [] },
  options: [optionSchema],
  product_type: { type: String },
  published_at: { type: Date, default: null },
  published_scope: { type: String, default: "web" },
  status: { type: String },
  tags: { type: String, default: "" },
  template_suffix: { type: String, default: null },
  title: { type: String },
  updated_at: { type: Date },
  variants: [variantSchema],
  vendor: { type: String },
});

// Create the model with an explicit collection name
const ShopifyProduct = model(
  "ShopifyProduct",
  shopifyProductSchema,
  "shopifyProducts"
);

export default ShopifyProduct;
