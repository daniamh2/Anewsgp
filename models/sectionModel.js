const mongoose = require("mongoose");
// 1- Create Schema
const sectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "section required"],
      unique: [true, "section must be unique"],
      minlength: [2, "Too short section name"],
      maxlength: [32, "Too long section name"],
    },
    // A and B => shopping.com/a-and-b
    slug: {
      type: String,
      lowercase: true,
    }
  },
  { timestamps: true }
);


// const setImageURL = (doc) => {
//   if (doc.image) {
//     const imageUrl = `${process.env.BASE_URL}/sections/${doc.image}`;
//     doc.image = imageUrl;
//   }
// };
// // findOne, findAll and update
// sectionSchema.post("init", (doc) => {
//   setImageURL(doc);
// });

// // create
// sectionSchema.post("save", (doc) => {
//   setImageURL(doc);
// });

// 2- Create model
const sectionModel = mongoose.model("section", sectionSchema);

module.exports = sectionModel;
