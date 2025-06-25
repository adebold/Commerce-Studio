/**
 * Mock for Magento's uiComponent
 */
module.exports = {
  extend: function(config) {
    // Create a constructor function that will initialize the component
    const Component = function() {
      // Copy defaults to the instance
      if (config.defaults) {
        Object.assign(this, config.defaults);
      }
      
      // Add all methods to the instance
      Object.keys(config).forEach(key => {
        if (typeof config[key] === 'function') {
          this[key] = config[key].bind(this);
        }
      });
      
      // Return the instance
      return this;
    };
    
    // Add the extend method to the constructor
    Component.extend = this.extend;
    
    // Add the defaults to the constructor
    Component.defaults = config.defaults || {};
    
    // Return the constructor
    return Component;
  }
};