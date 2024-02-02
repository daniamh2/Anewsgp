const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      required: [true, "first name required"],
    },
    lastName: {
      type: String,
      trim: true,
      required: [true, "last name required"],
    },
    userName: {
      type: String,
      trim: true,
      required: [true, "username required"],
      unique: true,
      minlength: [6, "username must have at least 6 characters  "],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "email required"],
      unique: true,
      lowercase: true,
    },
    phone: String,
    profileImg: String,

    password: {
      type: String,
      required: [true, "password required"],
      minlength: [6, "password must have at least 6 characters  "],
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
    role: {
  
          type: String,
          enum: ["admin", "editorInChief", "editor", "author", "techSupport"],
      
      
      
      default: "author",
    },
    section: {
      type: mongoose.Schema.ObjectId,
      ref: "section",
      required: [true, "user must be belong to section"],
    },
    // notification:[ {
    //   type: mongoose.Schema.ObjectId,
    //   ref: "section",
    //   required: [true, "user must be belong to section"],
    // }],
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // Hashing user password
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
// userSchema.pre(/^find/, function (next) {
//   this.populate({
//     path: "section",
//     select: "name -_id",
//   });
//   next();
// });

const setImageURL = (doc) => {
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/users/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }

};
// findOne, findAll and update
// userSchema.post('init', (doc) => {
//   setImageURL(doc);
// });

userSchema.post('save', (doc) => {
  setImageURL(doc);
});
const User = mongoose.model("User", userSchema);

module.exports = User;
