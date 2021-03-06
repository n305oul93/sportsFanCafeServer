const express = require('express')
const Blog = require('../models/blog')

const blogRouter = express.Router()

blogRouter
  .route('/')
  .get((req, res, next) => {
    Blog.find()
      .then(blogs => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(blogs)
      })
      .catch(err => next(err))
  })
  .post((req, res, next) => {
    Blog.create(req.body)
      .then(blog => {
        console.log('Blog created ', blog)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(blog)
      })
      .catch(err => next(err))
  })
  .put((req, res) => {
    res.statusCode = 403
    res.end('PUT operation not supported on /blog')
  })
  .delete((req, res, next) => {
    Blog.deleteMany()
      .then(response => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(response)
      })
      .catch(err => next(err))
  })

blogRouter
  .route('/:blogId')
  .get((req, res, next) => {
    Blog.findById(req.params.blogId)
      .then(blog => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(blog)
      })
      .catch(err => next(err))
  })
  .post((req, res) => {
    res.statusCode = 403
    res.end(`POST operation not supported on /blog/${req.params.blogId}`)
  })
  .put((req, res, next) => {
    Blog.findByIdAndUpdate(
      req.params.blogId,
      {
        $set: req.body
      },
      { new: true }
    )
      .then(blog => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(blog)
      })
      .catch(err => next(err))
  })
  .delete((req, res, next) => {
    Blog.findByIdAndDelete(req.params.blogId)
      .then(response => {
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(response)
      })
      .catch(err => next(err))
  })

blogRouter
  .route('/:blogId/comments')
  .get((req, res, next) => {
    Blog.findById(req.params.blogId)
      .then(blog => {
        if (blog) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          // remember the document gets returned as a js object
          res.json(blog.comments)
        } else {
          err = new Error(`Blog ${req.params.blogId} not found!`)
          err.status = 404
          return next(err)
        }
      })
      .catch(err => next(err))
  })
  .post((req, res, next) => {
    Blog.findById(req.params.blogId)
      .then(blog => {
        if (blog) {
          blog.comments.push(req.body)
          blog
            .save()
            .then(blog => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              // remember the document gets returned as a js object
              res.json(blog)
            })
            .catch(err => next(err))
        } else {
          err = new Error(`Blog ${req.params.blogId} not found!`)
          err.status = 404
          return next(err)
        }
      })
      .catch(err => next(err))
  })
  .put((req, res) => {
    res.statusCode = 403
    res.end(
      `PUT operation not supported on /blog/${req.params.blogId}/comments`
    )
  })
  .delete((req, res, next) => {
    Blog.findById(req.params.blogId)
      .then(blog => {
        if (blog) {
          for (let i = blog.comments.length - 1; i >= 0; i--) {
            blog.comments.id(blog.comments[i]._id).remove()
          }
          blog
            .save()
            .then(blog => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              // remember the document gets returned as a js object
              res.json(blog)
            })
            .catch(err => next(err))
        } else {
          err = new Error(`Blog ${req.params.blogId} not found!`)
          err.status = 404
          return next(err)
        }
      })
      .catch(err => next(err))
  })

blogRouter
  .route('/:blogId/comments/:commentId')
  .get((req, res, next) => {
    Blog.findById(req.params.blogId)
      .then(blog => {
        if (blog && blog.comments.id(req.params.commentId)) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          // remember the document gets returned as a js object
          res.json(blog.comments.id(req.params.commentId))
        } else if (!blog) {
          err = new Error(`Blog ${req.params.blogId} not found!`)
          err.status = 404
          return next(err)
        } else {
          err = new Error(`Comment ${req.params.commentId} not found!`)
          err.status = 404
          return next(err)
        }
      })
      .catch(err => next(err))
  })
  .post((req, res) => {
    res.statusCode = 403
    res.end(
      `POST operation not supported on /blog/${req.params.blogId}/comments/${req.params.commentId}`
    )
  })
  .put((req, res, next) => {
    Blog.findById(req.params.blogId)
      .then(blog => {
        if (blog && blog.comments.id(req.params.commentId)) {
          if (req.body.text) {
            blog.comments.id(req.params.commentId).text = req.body.text
          }
          blog
            .save()
            .then(blog => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.json(blog)
            })
            .catch(err => next(err))
        } else if (!blog) {
          err = new Error(`Blog ${req.params.blogId} not found!`)
          err.status = 404
          return next(err)
        } else {
          err = new Error(`Comment ${req.params.commentId} not found!`)
          err.status = 404
          return next(err)
        }
      })
      .catch(err => next(err))
  })
  .delete((req, res, next) => {
    Blog.findById(req.params.blogId)
      .then(blog => {
        if (blog && blog.comments.id(req.params.commentId)) {
          blog.comments.id(req.params.commentId).remove()
          blog
            .save()
            .then(blog => {
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.json(blog)
            })
            .catch(err => next(err))
        } else if (!blog) {
          err = new Error(`Blog ${req.params.blogId} not found!`)
          err.status = 404
          return next(err)
        } else {
          err = new Error(`Comment ${req.params.commentId} not found!`)
          err.status = 404
          return next(err)
        }
      })
      .catch(err => next(err))
  })

module.exports = blogRouter
