const sequelize = require('../config/connection');
const { Post, User, Comment } = require('../models');
const { session } = require('passport');
const router = require('express').Router();

// rendering all posts to homepage
router.get('/', (req, res) => {
    console.log(req.session);

    Post.findAll({
        attributes: [
          'id',
          'post_text',
          // 'title',
          'created_at',
          [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
        ],
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Comment,
            attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
            include: {
              model: User,
              attributes: ['username']
            }
          },
          {
            model: User,
            attributes: ['username', 'id']
          }
        ]
      })
        .then(dbPostData => {
          // pass a single post object into the homepage template
          const posts = dbPostData.map(post => post.get({ plain: true }));


          
          let loginStatus;
          if (typeof req.session.passport != 'undefined') {
            loginStatus = req.session.passport.user;
            console.log('loginStatus', loginStatus);
          } else {
              loginStatus = false;
          }
          console.log(loginStatus);




          // replacing loggedIn: req.session.loggedIn with loggedIn: loginStatus

          res.render('homepage', { posts,  loggedIn: loginStatus /*loggedIn: req.session.passport*/ }
          //{ posts, loggedIn: req.session.loggedIn }
          );
        })
        .catch(err => {
          console.log(err);
          res.status(500).json(err);
        });
});

// req.session.loggedIn

// redirecting users to homepage once they log in
router.get('/login', (req, res) => {
    if(req.session.loggedIn) {
        res.redirect('/');
        return; 
    }
    res.render('login');
});



// rendering sign up page 
router.get('/signup', (req, res) => {
  res.render('signup');
});

// rendering one post to the single-post page
router.get('/post/:id', (req, res) => {
    Post.findOne({
      where: {
        id: req.params.id
      },
      attributes: [
        'id',
        'post_text',
        // 'title',
        'created_at',
        [sequelize.literal('(SELECT COUNT(*) FROM vote WHERE post.id = vote.post_id)'), 'vote_count']
      ],
      include: [
        {
          model: Comment,
          attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
          include: {
            model: User,
            attributes: ['username']
          }
        },
        {
          model: User,
          attributes: ['username']
        }
      ]
    })
      .then(dbPostData => {
        if (!dbPostData) {
          res.status(404).json({ message: 'No post found with this id' });
          return;
        }
  
        // serialize the data
        const post = dbPostData.get({ plain: true });
  
        
        // let loginStatus;
        //   if (typeof req.session.passport != 'undefined') {
        //     loginStatus =  req.session.passport.user.id;
        //   } else {
        //       loginStatus = false;
        //   }
        //   console.log(loginStatus);
        
        
        
        
        
        // pass data to template
        res.render('single-post', { post, loggedIn: true });
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});

// rendering one user to the single-profile page
router.get('/profile/:id', (req, res) => {
  User.findOne({
      attributes: { exclude: ['password'] },
      where: {
        id: req.params.id,
        username: req.body.username,
        github: req.body.github,
        linkedin: req.body.linkedin
      },
      include: [
        {
          model: Post,
          attributes: ['id', /*'title',*/ 'post_text', 'created_at']
        },
        // include the Comment model here:
        {
          model: Comment,
          attributes: ['id', 'comment_text', 'created_at'],
          include: {
            /*model: Post,
            attributes: ['title']*/
          }
        },
        {
          model: Post,
          attributes: ['post_text'],
          through: Vote,
          as: 'voted_posts'
        }
      ]
    })
      .then(dbUserData => {
          if (!dbUserData) {
              res.status(404).json({ message: 'No user found with this id'});
              return;
          }
             
          
          // let loginStatus;
          // if (typeof req.session.passport != 'undefined') {
          //   loginStatus =  req.session.passport.user.id;
          // } else {
          //     loginStatus = false;
          // }
          // console.log(loginStatus);
          
          
          
          
          
            // serialize the data
            const user = { username: username, github: github, linkedin: linkedin}

            // pass data to template
            res.render('single-profile', { user, loggedIn: true });
    
      })
      .catch(err => {
          console.log(err);
          res.status(500).json(err);
      });
});

module.exports = router; 





