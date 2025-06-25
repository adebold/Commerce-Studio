const express = require('express');
const router = express.Router();
const ReportConfiguration = require('../models/ReportConfiguration');

// GET /api/report-configurations
router.get('/', async (req, res) => {
  try {
    const reportConfigurations = await ReportConfiguration.find();
    res.json(reportConfigurations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/report-configurations/:id
router.get('/:id', async (req, res) => {
  try {
    const reportConfiguration = await ReportConfiguration.findById(req.params.id);
    if (!reportConfiguration) {
      return res.status(404).json({ message: 'Report Configuration not found' });
    }
    res.json(reportConfiguration);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/report-configurations
router.post('/', async (req, res) => {
  try {
    const newReportConfiguration = new ReportConfiguration(req.body);
    const reportConfiguration = await newReportConfiguration.save();
    res.status(201).json(reportConfiguration);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/report-configurations/:id
router.put('/:id', async (req, res) => {
  try {
    const reportConfiguration = await ReportConfiguration.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reportConfiguration) {
      return res.status(404).json({ message: 'Report Configuration not found' });
    }
    res.json(reportConfiguration);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/report-configurations/:id
router.delete('/:id', async (req, res) => {
  try {
    const reportConfiguration = await ReportConfiguration.findByIdAndDelete(req.params.id);
    if (!reportConfiguration) {
      return res.status(404).json({ message: 'Report Configuration not found' });
    }
    res.json({ message: 'Report Configuration deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;