const express = require('express');
const router = express.Router();

router.get('/home', (req, res) => {
    res.render('loginpage',);
});
router.get('/sendotp', (req, res) => {
    res.render('sendotp',);
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Authenticate user here (simplified)
    User.findOne({ username, password }, (err, user) => {
        if (err || !user) {
            return res.status(401).send('Unauthorized');
        }
        req.session.role = user.role;
        res.redirect('/dashboard');
    });
});

// Dashboard route
router.get('/dashboard', (req, res) => {
    // if (!req.session.role) {
    //     return res.redirect('/');
    // }
   // res.render('dashboard', { role: req.session.role });
    res.render('dashboard', );
});

// Consultants route
router.get('/consultants', (req, res) => {
//     if (req.session.role !== 'admin') {
//         return res.redirect('/dashboard');
//    }
    res.render('consultants');
});

// Add Leads route
router.get('/add-leads', (req, res) => {
    // if (req.session.role !== 'consultant') {
    //     return res.redirect('/dashboard');
    // }
    res.render('add-leads');
});
module.exports = router;