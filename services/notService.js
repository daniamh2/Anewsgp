const asyncHandler = require('express-async-handler');
const factory = require('./handlersFactory');
const not = require('../models/notofication');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

// @desc    Get list of nots
// @route   GET /api/v1/nots
// @access  Public
exports.getnots = factory.getAll(not,"nots");

// @desc    Get specific not by id
// @route   GET /api/v1/nots/:id
// @access  Public
exports.getnot = factory.getOne(not);

// @desc    Create not
// @route   POST  /api/v1/nots
// @access  Private/Admin-Manager
exports.createOne = (Model) =>
asyncHandler(async (req, res) => { 
  const newDoc = await Model.create(req.body);
const  userId=req.user.id
//   emitNotification(userId, newDoc);

  res.status(201).json({ data: newDoc });
});//    


// @desc    Update specific not
// @route   PUT /api/v1/nots/:id
// @access  Private/Admin-Manager
exports.updatenot = factory.updateOne(not);

// @desc    Delete specific not
// @route   DELETE /api/v1/nots/:id
// @access  Private/Admin
exports.deletenot = factory.deleteOne(not);
