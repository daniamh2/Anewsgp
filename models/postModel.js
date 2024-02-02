const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Too short post title"],
      maxlength: [100, "Too long post title"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "post content is required"],
      minlength: [20, "Too short post content"],
    },

    imageCover: {
      type: String,
     required: [true, "post Image cover is required"],
    },
    images: [String],
    links: [String],
    tags: [String],
    type: {
      type: String,
      enum: ["news","breaking"],
      default: "news",
    },
    section: {
      type: mongoose.Schema.ObjectId,
      ref: "section",
      required: [true, "post must be belong to section"],
    },
    author: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "post must be belong to author"],
    },
    publicationDate: {
      type: Date,
      default: Date.now,
    },
    // status: {
    //   type: String,
    //   enum: ["pending", "published", "under-review", "draft"],
    //   default: "draft",
    // },
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

// Mongoose query middleware
postSchema.pre(/^find(?!ById)/g, function (next) {
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
const setImageURL = (doc) => {
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/posts/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    const imagesList = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/posts/${image}`;
      imagesList.push(imageUrl);
    });
    doc.images = imagesList;
  }
};
// findOne, findAll and update
postSchema.post('init', (doc) => {
  setImageURL(doc);
});

postSchema.post('save', (doc) => {
  setImageURL(doc);
});

module.exports = mongoose.model("post", postSchema);
