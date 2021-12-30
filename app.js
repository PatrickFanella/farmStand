//* Requirements:
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

//* Imported JS:
const Product = require('./models/product.js');
const Farm = require('./models/farm.js');

//* app Config:
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

//* Connect to mongod
mongoose
  .connect('mongodb://localhost:27017/farmStand')
  .then(() => {
    console.log('mongo connection open');
  })
  .catch((error) => {
    console.log('mongo connection error: ' + error);
    handleError(error);
  });
//* Farm Requests:

//* GET
app.get('/farms', async (req, res) => {
  const { city } = req.query;
  if (city) {
    const farms = await Farm.find({ city });
    res.render('farms/index', { farms, city });
  } else {
    const farms = await Farm.find({});
    res.render('farms/index', { farms, city: 'All' });
  }
});

app.get('/farms/new', (req, res) => {
  res.render('farms/new');
});

app.get('/farms/:id', async (req, res) => {
  const farm = await Farm.findById(req.params.id).populate('products');
  res.render('farms/farm', { farm });
});

app.get('/farms/:id/edit', async (req, res) => {
  const farm = await Farm.findById(req.params.id);
  res.render('farms/edit', { farm });
});

app.get('/farms/:id/products/new', async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    res.render('products/new', { categories, farm });
});

//* POST
app.post('/farms', async (req, res) => {
  const newFarm = new Farm(req.body);
  await newFarm.save();
  res.redirect(`/farms/${newFarm._id}`);
});

//*PUT
app.put('/farms/:id', async (req, res) => {
  const farm = await Farm.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true });
  res.redirect(`/farms/${farm._id}`);
});

//* DELETE
app.delete('/farms/:id', async (req, res) => {
  await Farm.findByIdAndDelete({ _id: req.params.id });
  res.redirect('/farms');
});

//* Product Requests:

//* GET

app.get('/products', async (req, res) => {
  const { category } = req.query;
  if (category) {
    const products = await Product.find({ category });
    res.render('products/index', { products, category });
  } else {
    const products = await Product.find({});
    res.render('products/index', { products, category: 'All' });
  }
});

app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate('farm', 'name');
  res.render('products/product', { product });
});

app.get('/products/:id/edit', async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render('products/edit', { product });
});

//* POST
app.post('/farms/:id/products/', async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  const { name, price, category } = req.body;
  const newProduct = new Product({ name, price, category });
  farm.products.push(newProduct);
  newProduct.farm = farm;
  await farm.save();
  await newProduct.save();
  res.redirect(`/farms/${id}`);
});

//* PUT
app.put('/products/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { runValidators: true, new: true });
  res.redirect(`/products/${product._id}`);
});

//* DELETE
app.delete('/products/:id', async (req, res) => {
  await Product.findByIdAndDelete({ _id: req.params.id });
  res.redirect('/products');
});

//* Server Start
app.listen(3000, () => {
  console.log('listening on port 3000');
});
