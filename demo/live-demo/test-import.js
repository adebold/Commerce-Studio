import('../../services/nvidia/omniverse-avatar-service.js')
  .then(m => console.log('Import successful:', !!m.default))
  .catch(e => console.error('Import failed:', e.message));