import mongoose, { model } from "mongoose";
const { Schema } = mongoose;

// Address sub-schema
const addressSchema = new Schema({
  id: { type: Schema.Types.Number, required: true },
  customer_id: { type: Schema.Types.Number, required: true },
  first_name: { type: String },
  last_name: { type: String },
  company: { type: String, default: null },
  address1: { type: String },
  address2: { type: String, default: null },
  city: { type: String },
  province: { type: String },
  country: { type: String },
  zip: { type: String },
  phone: { type: String, default: null },
  name: { type: String, default: "" },
  province_code: { type: String, default: null },
  country_code: { type: String, default: "" },
  country_name: { type: String, default: "" },
  default: { type: Boolean, default: false },
});

// Main ShopifyCustomer schema
const shopifyCustomerSchema = new Schema({
  //   _id: { type: Schema.Types.Number, required: true },
  addresses: [addressSchema],
  admin_graphql_api_id: { type: String },
  created_at: { type: Date },
  currency: { type: String, default: "" },
  default_address: addressSchema,
  email: { type: String },
  email_marketing_consent: {
    state: { type: String, default: "not_subscribed" },
    opt_in_level: { type: String, default: "single_opt_in" },
    consent_updated_at: { type: Date, default: null },
  },
  first_name: { type: String },
  last_name: { type: String },
  last_order_id: { type: Schema.Types.Number, default: null },
  last_order_name: { type: String, default: null },
  multipass_identifier: { type: String, default: null },
  note: { type: String, default: null },
  orders_count: { type: Number, default: 0 },
  phone: { type: String, default: null },
  sms_marketing_consent: { type: Schema.Types.Mixed, default: null },
  state: { type: String, default: "disabled" },
  tags: { type: String, default: "" },
  tax_exempt: { type: Boolean, default: false },
  tax_exemptions: { type: [String], default: [] },
  total_spent: { type: String, default: "0.00" },
  updated_at: { type: Date },
  verified_email: { type: Boolean, default: true },
});

// Create the model
const ShopifyCustomer = model(
  "ShopifyCustomer",
  shopifyCustomerSchema,
  "shopifyCustomers"
);

export default ShopifyCustomer;
