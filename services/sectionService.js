const factory = require('./handlersFactory');
const section = require('../models/sectionModel');

// @desc    Get list of sections
// @route   GET /api/v1/sections
// @access  Public
exports.getsections = factory.getAll(section);

// @desc    Get specific section by id
// @route   GET /api/v1/sections/:id
// @access  Public
exports.getsection = factory.getOne(section);

// @desc    Create section
// @route   POST  /api/v1/sections
// @access  Private/Admin-Manager
exports.createsection = factory.createOne(section);

// @desc    Update specific section
// @route   PUT /api/v1/sections/:id
// @access  Private/Admin-Manager
exports.updatesection = factory.updateOne(section);

// @desc    Delete specific section
// @route   DELETE /api/v1/sections/:id
// @access  Private/Admin
exports.deletesection = factory.deleteOne(section);
