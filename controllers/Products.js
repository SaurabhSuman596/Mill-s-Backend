import mongoose from 'mongoose';
import Products from '../models/Products.js';
import User from '../models/User.js';
import { createError } from '../error.js';

export const addProducts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user)
      return createError({
        status: 301,
        message: 'User not found',
      });

    if (!user?.isAdmin) {
      return createError({
        status: 301,
        message: 'You are not an Admin',
      });
    }

    const productsData = req.body;

    const { title, name, desc, img, price, sizes, category } = productsData;

    const product = new Products({
      title,
      name,
      desc,
      img,
      price,
      sizes,
      category,
    });
    const createdproduct = await product.save();

    return res
      .status(201)
      .json({ message: 'Products added successfully', createdproduct });
  } catch (err) {
    next(err);
  }
};

export const getproducts = async (req, res, next) => {
  try {
    let { categories, minPrice, maxPrice, sizes, search } = req.query;

    sizes = sizes?.split(',');
    categories = categories?.split(',');

    const filter = {};

    if (categories && Array.isArray(categories)) {
      filter.category = { $in: categories }; // Match products in any of the specified categories
    }

    if (minPrice || maxPrice) {
      filter['price.org'] = {};
      if (minPrice) {
        filter['price.org']['$gte'] = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter['price.org']['$lte'] = parseFloat(maxPrice);
      }
    }

    if (sizes && Array.isArray(sizes)) {
      filter.sizes = { $in: sizes }; // Match products in any of the specified sizes
    }

    if (search) {
      filter.$or = [
        { title: { $regex: new RegExp(search, 'i') } }, // Case-insensitive title search
        { desc: { $regex: new RegExp(search, 'i') } }, // Case-insensitive description search
      ];
    }

    const products = await Products.find(filter);
    return res.status(200).json(products);
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return next(createError(400, 'Invalid product ID'));
    }
    const product = await Products.findById(id);
    if (!product) {
      return next(createError(404, 'Product not found'));
    }
    return res.status(200).json(product);
  } catch (err) {
    return next(error);
  }
};

//Delete Product
export const deleteProductById = async (req, res, next) => {
  try {
    const id = req.body.id;
    if (!mongoose.isValidObjectId(id)) {
      return next(createError(400, 'Invalid product ID'));
    }

    await Products.findByIdAndDelete(id);
    return res.status(204).json({
      message: 'Product deleted',
      status: 204,
    });
  } catch (err) {
    return createError(404, err.message);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user)
      return createError({
        status: 301,
        message: 'User not found',
      });

    if (!user?.isAdmin) {
      return createError({
        status: 301,
        message: 'You are not an Admin',
      });
    }

    const productsData = req.body;

    const { title, name, desc, img, price, sizes, category } = productsData;

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return next(createError(400, 'Invalid product ID'));
    }
    const product = await Products.findById(id);
    if (!product) {
      return next(createError(404, 'Product not found'));
    }

    const updatedProduct = await Products.findByIdAndUpdate(id, {
      title,
      name,
      desc,
      img,
      price,
      sizes,
      category,
    });

    return res.status(200).json({
      status: 200,
      message: 'Product updated',
      product: updateProduct,
    });
  } catch (err) {
    next(err);
  }
};
