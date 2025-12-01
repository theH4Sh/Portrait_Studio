const Portfolio = require('../models/Portfolio');

const createPortfolio = async (req, res, next) => {
  try {
    const { title, description, category } = req.body;

    if (!req.file) {
      return res.status(400).json({error: 'Product Image Required'})
    }

    if (!title) {
      return res.status(400).json({ error: "Title required" });
    }

    const item = await Portfolio.create({ 
      title, 
      description, 
      imageUrl: req.file.filename, 
      category 
    });
    res.status(201).json({ message: "Portfolio added", item });
  } catch (err) {
    next(err);
  }
};

// Update portfolio item
const updatePortfolio = async (req, res, next) => {
  try {
    const updates = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category
    };

    if (req.file) {
      updates.imageUrl = req.file.filename;
    }

    const updated = await Portfolio.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.json({ success: true, updated });
  } catch (err) {
    next(err);
  }
};

const deletePortfolio = async (req, res, next) => {
  try {
    const deleted = await Portfolio.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });

    res.json({ message: "Portfolio deleted" });
  } catch (err) {
    next(err);
  }
};

const getPortfolio = async (req, res, next) => {
  try {
    const item = await Portfolio.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Not found" });

    res.json({ item });
  } catch (err) {
    next(err);
  }
};

const getAllPortfolio = async (req, res, next) => {
  try {
    const items = await Portfolio.find().sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolio,
  getAllPortfolio
};
