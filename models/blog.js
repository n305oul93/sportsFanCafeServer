const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema(
  {
    likes: {
      type: Number
    },
    dislikes: {
      type: Number
    },
    text: {
      type: String,
      required: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
)

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    author: {
      type: String,
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    comments: [commentSchema]
  },
  { timestamps: true }
)

const Blog = mongoose.model('Blog', blogSchema)

module.exports = Blog
