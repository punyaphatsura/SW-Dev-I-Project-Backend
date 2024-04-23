import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [50, "Name can not be more than 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Please add an address"],
    },
    district: {
      type: String,
      required: [true, "Please add a district"],
    },
    province: {
      type: String,
      required: [true, "Please add a province"],
    },
    tel: {
      type: String,
    },
    opentime: {
      type: String,
      required: [true, "Please add opentime"],
    },
    closetime: {
      type: String,
      required: [true, "Please add closetime"],
    }    
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Reverse populate with virtuals
RestaurantSchema.virtual(`appointments`, {
  ref: `Appointment`,
  localField: `_id`,
  foreignField: `restaurant`,
  justOne: false,
});

// Cascade delete appointments when a restaurant is deleted
RestaurantSchema.pre(
  `deleteOne`,
  { document: true, query: false },
  async function (next) {
    console.log(`Appointment being removed from restaurant ${this._id}`);
    await this.model(`Appointment`).deleteMany({ restaurant: this._id });
    next();
  },
);

const Restaurant = mongoose.model("Restaurant", RestaurantSchema);

export default Restaurant;
