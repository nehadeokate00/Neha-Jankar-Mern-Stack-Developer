const mongoose = require('mongoose');

const productTransactionSchema = new mongoose.Schema({
  id: Number,
  title: String,
  description: String,
  price: Number,
  dateOfSale: Date,
  category: String,
  sold: Boolean
});

const ProductTransaction = mongoose.model('ProductTransaction', productTransactionSchema);
const axios = require('axios');
const ProductTransaction = require('./models/ProductTransaction'); // Import model

const seedDatabase = async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = response.data;

    // Remove all current records to avoid duplication
    await ProductTransaction.deleteMany();

    // Insert fetched data
    await ProductTransaction.insertMany(data);
    res.status(200).json({ message: 'Database seeded successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error seeding the database' });
  }
};
const listTransactions = async (req, res) => {
    const { page = 1, perPage = 10, search = '' } = req.query;
    const searchQuery = search
      ? { $or: [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }, { price: { $regex: search } }] }
      : {};
  
    try {
      const transactions = await ProductTransaction.find(searchQuery)
        .skip((page - 1) * perPage)
        .limit(Number(perPage));
      const total = await ProductTransaction.countDocuments(searchQuery);
  
      res.status(200).json({ transactions, total });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching transactions' });
    }
  };
  const getStatistics = async (req, res) => {
    const { month } = req.query;
    const startDate = new Date(2024, month - 1, 1);
    const endDate = new Date(2024, month, 0);
  
    try {
      const totalSaleAmount = await ProductTransaction.aggregate([
        { $match: { dateOfSale: { $gte: startDate, $lt: endDate }, sold: true } },
        { $group: { _id: null, totalAmount: { $sum: '$price' } } }
      ]);
  
      const soldItemsCount = await ProductTransaction.countDocuments({ dateOfSale: { $gte: startDate, $lt: endDate }, sold: true });
      const notSoldItemsCount = await ProductTransaction.countDocuments({ dateOfSale: { $gte: startDate, $lt: endDate }, sold: false });
  
      res.status(200).json({ totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0, soldItemsCount, notSoldItemsCount });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching statistics' });
    }
  };
  const getPriceRangeData = async (req, res) => {
    const { month } = req.query;
    const startDate = new Date(2024, month - 1, 1);
    const endDate = new Date(2024, month, 0);
  
    const priceRanges = [
      { range: '0-100', min: 0, max: 100 },
      { range: '101-200', min: 101, max: 200 },
      { range: '201-300', min: 201, max: 300 },
      { range: '301-400', min: 301, max: 400 },
      { range: '401-500', min: 401, max: 500 },
      { range: '501-600', min: 501, max: 600 },
      { range: '601-700', min: 601, max: 700 },
      { range: '701-800', min: 701, max: 800 },
      { range: '801-900', min: 801, max: 900 },
      { range: '901-above', min: 901, max: Number.MAX_SAFE_INTEGER }
    ];
  
    try {
      const priceRangeData = await Promise.all(
        priceRanges.map(async (range) => {
          const count = await ProductTransaction.countDocuments({
            dateOfSale: { $gte: startDate, $lt: endDate },
            price: { $gte: range.min, $lte: range.max }
          });
          return { range: range.range, count };
        })
      );
  
      res.status(200).json(priceRangeData);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching price range data' });
    }
  };
  const getCategoryData = async (req, res) => {
    const { month } = req.query;
    const startDate = new Date(2024, month - 1, 1);
    const endDate = new Date(2024, month, 0);
  
    try {
      const categoryData = await ProductTransaction.aggregate([
        { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
  
      res.status(200).json(categoryData);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching category data' });
    }
  };
  const getCombinedData = async (req, res) => {
    try {
      const statistics = await getStatistics(req, res);
      const priceRangeData = await getPriceRangeData(req, res);
      const categoryData = await getCategoryData(req, res);
  
      res.status(200).json({
        statistics: statistics.data,
        priceRangeData: priceRangeData.data,
        categoryData: categoryData.data
      });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching combined data' });
    }
  };
  const express = require('express');
const app = express();
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/transactions', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(express.json());

app.post('/initialize-database', seedDatabase);
app.get('/transactions', listTransactions);
app.get('/statistics', getStatistics);
app.get('/price-range', getPriceRangeData);
app.get('/category-data', getCategoryData);
app.get('/combined-data', getCombinedData);

app.listen(3000, () => console.log('Server running on port 3000'));