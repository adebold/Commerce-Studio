// This script generates placeholder images for the VARAi landing page
// Run with: node generate-placeholders.js

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Ensure the public directory exists
const publicDir = path.join(__dirname);
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate hero image
function generateHeroImage() {
  const width = 800;
  const height = 600;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#1890FF');
  gradient.addColorStop(1, '#0050B3');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add some shapes to represent eyewear
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.ellipse(400, 300, 200, 100, 0, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.ellipse(400, 300, 150, 75, 0, 0, 2 * Math.PI);
  ctx.fill();

  // Add text
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.fillText('VARAi', 400, 280);
  
  ctx.font = '30px Arial';
  ctx.fillText('Virtual Try-On Technology', 400, 330);

  // Save the image
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(path.join(publicDir, 'hero-image.jpg'), buffer);
  console.log('Hero image created: hero-image.jpg');
}

// Generate demo image
function generateDemoImage() {
  const width = 600;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create background
  ctx.fillStyle = '#f0f9ff';
  ctx.fillRect(0, 0, width, height);

  // Draw a face outline
  ctx.strokeStyle = '#1890FF';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(300, 200, 150, 180, 0, 0, 2 * Math.PI);
  ctx.stroke();

  // Draw glasses
  ctx.lineWidth = 3;
  ctx.beginPath();
  // Left lens
  ctx.ellipse(240, 180, 60, 40, 0, 0, 2 * Math.PI);
  // Right lens
  ctx.ellipse(360, 180, 60, 40, 0, 0, 2 * Math.PI);
  // Bridge
  ctx.moveTo(300, 180);
  ctx.lineTo(300, 180);
  ctx.stroke();

  // Add text
  ctx.font = 'bold 24px Arial';
  ctx.fillStyle = '#1890FF';
  ctx.textAlign = 'center';
  ctx.fillText('Virtual Try-On Demo', 300, 350);

  // Save the image
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(path.join(publicDir, 'demo-image.jpg'), buffer);
  console.log('Demo image created: demo-image.jpg');
}

// Generate testimonial avatars
function generateTestimonialAvatar(filename, color, initial) {
  const size = 200;
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Create circular background
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, 2 * Math.PI);
  ctx.fill();

  // Add initial
  ctx.font = 'bold 100px Arial';
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initial, size/2, size/2);

  // Save the image
  const buffer = canvas.toBuffer('image/jpeg');
  fs.writeFileSync(path.join(publicDir, filename), buffer);
  console.log(`Testimonial avatar created: ${filename}`);
}

// Generate hero pattern
function generateHeroPattern() {
  const width = 400;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Transparent background
  ctx.fillStyle = 'transparent';
  ctx.fillRect(0, 0, width, height);

  // Draw pattern
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;

  // Draw grid
  for (let i = 0; i < width; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, height);
    ctx.stroke();
  }

  for (let i = 0; i < height; i += 20) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(width, i);
    ctx.stroke();
  }

  // Draw circles
  for (let x = 0; x < width; x += 80) {
    for (let y = 0; y < height; y += 80) {
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.stroke();
    }
  }

  // Save the image
  const buffer = canvas.toBuffer('image/svg+xml');
  fs.writeFileSync(path.join(publicDir, 'hero-pattern.svg'), buffer);
  console.log('Hero pattern created: hero-pattern.svg');
}

// Generate all images
try {
  generateHeroImage();
  generateDemoImage();
  generateTestimonialAvatar('testimonial-1.jpg', '#1890FF', 'S');
  generateTestimonialAvatar('testimonial-2.jpg', '#52C41A', 'M');
  generateTestimonialAvatar('testimonial-3.jpg', '#FAAD14', 'E');
  generateHeroPattern();
  console.log('All placeholder images generated successfully!');
} catch (error) {
  console.error('Error generating placeholder images:', error);
}