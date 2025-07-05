// Mock for styled-components and @emotion/styled
// This file provides a simple mock implementation that returns components that render their children

// Create a simple styled mock function
const createStyled = () => {
  // Create the base styled function
  const styled = (Component) => {
    // Return a function that accepts template literals
    return (...args) => {
      // Return a component that renders its children
      const StyledComponent = (props) => {
        const { children, ...rest } = props;
        
        // If Component is a string (HTML element), render it directly
        if (typeof Component === 'string') {
          return {
            type: Component,
            props: { ...rest, children }
          };
        }
        
        // Otherwise, render the Component with props
        return {
          type: Component,
          props: { ...rest, children }
        };
      };
      
      // Add necessary properties to make it work with emotion
      StyledComponent.displayName = `Styled(${typeof Component === 'string' ? Component : 'Component'})`;
      StyledComponent.toString = () => `.${StyledComponent.displayName}`;
      StyledComponent.withComponent = (nextComp) => styled(nextComp)(...args);
      
      return StyledComponent;
    };
  };
  
  // Add HTML element methods
  const htmlElements = [
    'a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', 'b', 'base', 'bdi', 'bdo', 'big', 'blockquote', 'body',
    'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details',
    'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2',
    'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'img', 'input', 'ins', 'kbd',
    'keygen', 'label', 'legend', 'li', 'link', 'main', 'map', 'mark', 'menu', 'menuitem', 'meta', 'meter', 'nav',
    'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'pre', 'progress', 'q', 'rp',
    'rt', 'ruby', 's', 'samp', 'script', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub',
    'summary', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'u',
    'ul', 'var', 'video', 'wbr', 'circle', 'clipPath', 'defs', 'ellipse', 'foreignObject', 'g', 'image', 'line',
    'linearGradient', 'marker', 'mask', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'stop',
    'svg', 'text', 'tspan', 'video'
  ];
  
  htmlElements.forEach(tag => {
    styled[tag] = styled(tag);
  });
  
  return styled;
};

// Create the styled mock
const styled = createStyled();

// Export as both default and named export
module.exports = styled;
module.exports.default = styled;
module.exports.createGlobalStyle = () => ({ GlobalStyle: () => null });
module.exports.css = () => 'mock-css';
module.exports.keyframes = () => 'mock-animation-name';
module.exports.ThemeProvider = ({ children }) => children;