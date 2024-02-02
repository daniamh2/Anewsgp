const mongoose = require("mongoose");

const copySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      // required: true,
      trim: true,
      minlength: [3, "Too short post title"],
      maxlength: [100, "Too long post title"],
    },
    // oldtitle: {
    //   type: String,
    //   required: true,
    //   trim: true,
    //   minlength: [3, "Too short post title"],
    //   maxlength: [100, "Too long post title"],
    // },
    slug: {
      type: String,
      // required: true,
      lowercase: true,
    },
    content: {
      type: String,
      // required: [true, "post content is required"],
      minlength: [20, "Too short post content"],
    },
    // oldcontent: {
    //   type: String,
    //   required: [true, "post content is required"],
    //   minlength: [20, "Too short post content"],
    // },
    postId: { type: mongoose.Schema.ObjectId, ref: "post" },
    imageCover: {
      type: String,
      // required: [true, "copy Image cover is required"],
    },
    images: [String],
    tags: [String],
    links: [String],
    section: {
      type: mongoose.Schema.ObjectId,
      ref: "section",
      // required: [true, "post must belong to section"],
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      // required: [true, "post must be belong to author"],
    }, 
     admin: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      // required: [true, "post must be belong to author"],
    },
    submissionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "published", "under-review", "draft"],
      default: "draft",
    },
    editor: 
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    
  },
  {
    timestamps: true,
    // to enable virtual populate
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);


const setImageURL = (doc) => {
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/copys/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/copys/${image}`;
      imagesList.push(imageUrl);
    });
    doc.images = imagesList;
  }
};
// findOne, findAll and update

// Mongoose query middleware
copySchema.pre(/^find(?!ById)/g, function (next) {
  this.populate({
    path: "section",
    select: "name -_id", 
  });
    this.populate({
    path: "author editor",
    select: "userName firstName lastName -_id ",
  });
  next();
});
copySchema.post("init", (doc) => {
  setImageURL(doc);
});

copySchema.post("save", (doc) => {
  setImageURL(doc);
});

module.exports = mongoose.model("copy", copySchema);
