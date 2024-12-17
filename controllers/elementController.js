const Element = require('../models/Element');

exports.getAllElements = async (req, res) => {
  const elements = await Element.find({ createdBy: req.user.id });
  res.json(elements);
};

exports.getElementById = async (req, res) => {
  const element = await Element.findOne({ _id: req.params.id, createdBy: req.user.id });
  if (!element) return res.status(404).json({ message: 'Élément non trouvé' });
  res.json(element);
};

exports.createElement = async (req, res) => {
  const { name, description } = req.body;
  const element = new Element({ name, description, createdBy: req.user.id });
  await element.save();
  res.status(201).json(element);
};

exports.updateElement = async (req, res) => {
  const element = await Element.findOneAndUpdate(
    { _id: req.params.id, createdBy: req.user.id },
    req.body,
    { new: true }
  );
  if (!element) return res.status(404).json({ message: 'Élément non trouvé' });
  res.json(element);
};

exports.deleteElement = async (req, res) => {
  const element = await Element.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
  if (!element) return res.status(404).json({ message: 'Élément non trouvé' });
  res.json({ message: 'Élément supprimé' });
};
