const router = require('express').Router();
const sequelize = require('../config/connection');
const { Post, User, Comment } = require('../models');
const { Op } = require('sequelize');
// const withAuth = require('../utils/auth');   // -- search will not require login.

// -- search sample for Insomnia  GET http://localhost:3001/search/heroku
router.get('/:post_text', (req, res) => {
    Post.findOne({
      limit: 10,
      where: {
        post_text: {
          [Op.like]: '%' + req.params.post_text + '%'
        }
      },
        attributes: [
            'id', 
            'post_text',
            // [sequelize.literal('(SELECT * FROM post WHERE post_text LIKE `Heroku`)'), 'post_text'],
            'created_at'
        ],        
      })    
      .then(dbSearchData => {
          console.log(dbSearchData);
        if (!dbSearchData) {
          res.status(404).json({ message: 'No post found with this search criteria' });
          return;
        }
        // res.json(dbSearchData);
        const posts = dbSearchData;
        res.render('search', { posts }); 
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});

module.exports = router; 




