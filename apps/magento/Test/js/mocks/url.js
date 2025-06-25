/**
 * Mock for Magento's mage/url module
 */
module.exports = {
  build: function(path) {
    return `https://example.com/${path}`;
  },
  
  getUrl: function(path, params) {
    let url = `https://example.com/${path}`;
    
    if (params) {
      const queryParams = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
        
      url += `?${queryParams}`;
    }
    
    return url;
  },
  
  setBaseUrl: function(baseUrl) {
    // This is a mock, so we don't actually change anything
    return this;
  }
};