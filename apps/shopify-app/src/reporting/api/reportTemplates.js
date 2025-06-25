const express = require('express');
const router = express.Router();
const ReportTemplate = require('../models/ReportTemplate');

// GET /api/report-templates
router.get('/', async (req, res) => {
  try {
    const reportTemplates = await ReportTemplate.find();
    res.json(reportTemplates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET /api/report-templates/:id
router.get('/:id', async (req, res) => {
  try {
    const reportTemplate = await ReportTemplate.findById(req.params.id);
    if (!reportTemplate) {
      return res.status(404).json({ message: 'Report Template not found' });
    }
    res.json(reportTemplate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// POST /api/report-templates
router.post('/', async (req, res) => {
  try {
    const newReportTemplate = new ReportTemplate(req.body);
    const reportTemplate = await newReportTemplate.save();
    res.status(201).json(reportTemplate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT /api/report-templates/:id
router.put('/:id', async (req, res) => {
  try {
    const reportTemplate = await ReportTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reportTemplate) {
      return res.status(404).json({ message: 'Report Template not found' });
    }
    res.json(reportTemplate);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE /api/report-templates/:id
router.delete('/:id', async (req, res) => {
  try {
    const reportTemplate = await ReportTemplate.findByIdAndDelete(req.params.id);
    if (!reportTemplate) {
      return res.status(404).json({ message: 'Report Template not found' });
    }
    res.json({ message: 'Report Template deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;