const adviser  = require('../controllers/admin.controler');

const router = require('express').Router();

router.get('/',adviser.GetAllAdviser)
router.post('/getSearchedadviser',adviser.GetSearchedAdviser)
router.post('/login',adviser.Login)
router.post('/register',adviser.Register)
router.post('/edit',adviser.Edit)
router.patch('/update/:id', adviser.Update);
router.delete('/delete/:id', adviser.Delete);

module.exports = router;