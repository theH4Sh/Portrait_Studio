const Feedback = require('../models/Feedback');

const addFeedback = async (req, res, next) => {
  try {
    const { message, rating } = req.body;

    if (!message || !rating)
      return res.status(400).json({ error: "Message and rating are required" });

    const fb = await Feedback.create({
      message,
      rating,
      user: req.user._id
    });

    res.json({ message: "Feedback submitted, pending admin approval", fb });
  } catch (err) {
    next(err);
  }
};

const approveFeedback = async (req, res, next) => {
  try {
    const fb = await Feedback.findById(req.params.id);
    if (!fb) return res.status(404).json({ error: "Not found" });

    fb.approved = true;
    await fb.save();

    res.json({ message: "Feedback approved", fb });
  } catch (err) {
    next(err);
  }
};

const getFeedbacks = async (req, res, next) => {
  try {
    const fbs = await Feedback.find({ approved: true })
    .populate('user', 'username')
    .sort({ createdAt: -1 })
    res.json({ feedbacks: fbs });
  } catch (err) {
    next(err);
  }
};

const getAllFeedbacks = async (req, res, next) => {
  try {
    const fbs = await Feedback.find()
          .populate('user', 'username email')
    if (fbs.length === 0) {
      return res.status(404).json({message: "No feedbacks found"})
    }

    res.json({ feedbacks: fbs})
  } catch (err) {
    next(err)
  }
}

const deleteFeedback = async (req, res, next) => {
  try {
    const fb = await Feedback.findById(req.params.id);

    if (!fb) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = fb.user.toString() === req.user._id.toString();

    // Only admin OR the owner can delete
    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: "Not allowed to delete this feedback" });
    }

    await fb.deleteOne();

    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  addFeedback,
  approveFeedback,
  getFeedbacks,
  getAllFeedbacks,
  deleteFeedback
};
