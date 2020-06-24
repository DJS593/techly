const router = require('express').Router();

const apiRoutes = require('./api');
const homeRoutes = require('./home-routes.js');
const profileRoutes = require('./profile-routes.js');
const profileCardRoutes = require('./profile-card-routes')

router.use('/', homeRoutes);
router.use('/api', apiRoutes);
router.use('/profile', profileRoutes);
router.use('/profile', profileCardRoutes);

router.use((req, res) => {
  res.status(404).end();
});

module.exports = router;