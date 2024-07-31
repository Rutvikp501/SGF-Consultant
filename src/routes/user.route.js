const User  = require('../controllers/admin.controler');

const router = require('express').Router();

router.get('/',User.GetAllUser)
router.post('/getSearcheduser',User.GetSearchedUser)
router.post('/login',User.Login)
router.post('/register',User.Register)
router.post('/edit',User.Edit)
router.patch('/update/:id', User.Update);
router.delete('/delete/:id', User.Delete);
router.post('/forgotPassword',User.forgotPassword)
router.post('/resetPassword',User.resetPassword)

module.exports = router;