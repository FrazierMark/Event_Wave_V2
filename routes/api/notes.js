const express = require('express');
const router = express.Router();
const locationsCtrl = require('../../controllers/locations');
//const multer = require('multer')
//const upload = multer(); // <- handles multipart/formdata requests(photos)

// /*---------- Public Routes ----------*/

router.post('/notes/:id', locationsCtrl.addNote)
router.delete('/notes/:id', locationsCtrl.deleteNote)


/*---------- Protected Routes ----------*/

module.exports = router;