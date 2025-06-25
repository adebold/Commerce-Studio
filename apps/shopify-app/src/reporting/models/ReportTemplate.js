const mongoose = require('mongoose');

const ReportTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  dataSource: {
    type: String,
    required: true,
    enum: ['Shopify', 'VARAi Commerce Studio']
  },
  reportType: {
    type: String,
    required: true
  },
  customizationOptions: {
    type: Object
  }
});

module.exports = mongoose.model('ReportTemplate', ReportTemplateSchema);