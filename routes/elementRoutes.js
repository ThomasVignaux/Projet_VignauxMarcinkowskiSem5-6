const express = require('express');
const router = express.Router();
const {
  getAllElements,
  getElementById,
  createElement,
  updateElement,
  deleteElement
} = require('../controllers/elementController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);
router.get('/', getAllElements);
router.get('/:id', getElementById);
router.post('/', createElement);
router.put('/:id', updateElement);
router.delete('/:id', deleteElement);

module.exports = router;
