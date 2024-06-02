import express from 'express';
import {
  addProducts,
  deleteProductById,
  getProductById,
  getproducts,
  updateProduct,
} from '../controllers/Products.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.post('/add', verifyToken, addProducts);
router.get('/', getproducts);
router.get('/:id', getProductById);
router.put('/:id', verifyToken, updateProduct);
router.delete('/', verifyToken, deleteProductById);

export default router;
