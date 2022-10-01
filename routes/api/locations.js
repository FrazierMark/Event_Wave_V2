const express = require('express');
const router = express.Router();
const locationsCtrl = require('../../controllers/locations');
//const multer = require('multer')
//const upload = multer(); // <- handles multipart/formdata requests(photos)
// /*---------- Public Routes ----------*/
router.post('/', locationsCtrl.create);
router.get('/', locationsCtrl.index)
router.delete('/:id', locationsCtrl.deleteLocation)
router.post('/:id/notes', locationsCtrl.addNote)
router.delete('/:id/notes', locationsCtrl.deleteNote)


/*---------- Protected Routes ----------*/

module.exports = router;