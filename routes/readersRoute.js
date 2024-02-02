const express = require("express");

const router = express.Router();

const sectionRoute = require('./sectionRoute');
const postRoute = require('./postRoute');
const userRoute = require('./userRoute');

router.use('/sections', sectionRoute);
router.use('/posts', postRoute);
const posts = require('../models/postModel')

router.use('/users', userRoute);


// router.get('/i', (req, res) => {
//     res.sendFile(`${process.env.BASE_URL}posts/post-a7972991-bd86-474d-8658-7912d4728f46-1704235252396-cover.jpeg` );
//   });  //photo viewer

module.exports = router;