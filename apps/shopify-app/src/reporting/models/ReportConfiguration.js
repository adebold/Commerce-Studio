const mongoose = require('mongoose');

const ReportConfigurationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  reportTemplateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReportTemplate',
    required: true
  },
  filters: {
    type: Object
  },
  grouping: {
    type: Object
  },
  sorting: {
    type: Object
  },
  visualization: {
    type: String
  }
});

module.exports = mongoose.model('ReportConfiguration', ReportConfigurationSchema);