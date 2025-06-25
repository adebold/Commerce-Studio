#!/usr/bin/env node
import dotenv from 'dotenv';
import readline from 'readline';
import chalk from 'chalk';
import { VertexAIConnector } from '../connectors/vertex-ai-connector.js';
import { logger } from '../utils/logger.js';

// Load environment variables
dotenv.config();

// Configuration
const SHOP_DOMAIN = process.env.SHOP_DOMAIN || 'example.myshopify.com';
const DEFAULT_WELCOME_MESSAGE = "Hi! I'm your eyewear shopping assistant. I can help you find the perfect frames based on your face shape, style preferences, and needs. How can I help you today?";

console.log(chalk.cyan('=================================================='));
console.log(chalk.bold.cyan('       Vertex AI Shopping Assistant Demo'));
console.log(chalk.cyan('=================================================='));
console.log(chalk.yellow('\nConnected to shop: ') + chalk.bold(SHOP_DOMAIN));
console.log(chalk.yellow('\nType your questions about eyewear products or type "exit" to quit.'));
console.log(chalk.yellow('Example questions:'));
console.log(chalk.gray(' - What sunglasses do you recommend for a round face?'));
console.log(chalk.gray(' - Do you have any blue light glasses?'));
console.log(chalk.gray(' - Can you suggest lightweight frames for everyday use?'));
console.log(chalk.gray(' - What are your best-selling women\'s frames?'));
console.log(chalk.cyan('==================================================\n'));

// Initialize the assistant
const vertexAI = new VertexAIConnector(SHOP_DOMAIN);
const sessionId = `demo_session_${Date.now()}`;

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Display the welcome message
console.log(chalk.green('Assistant: ') + DEFAULT_WELCOME_MESSAGE + '\n');

// Main interaction loop
async function promptUser() {
  rl.question(chalk.blue('You: '), async (query) => {
    // Check if user wants to exit
    if (query.toLowerCase() === 'exit') {
      console.log(chalk.yellow('\nThank you for using the Vertex AI Shopping Assistant Demo!'));
      rl.close();
      return;
    }

    try {
      // Show typing indicator
      process.stdout.write(chalk.green('Assistant: ') + chalk.gray('Thinking...'));
      
      // Get response from Vertex AI
      const result = await vertexAI.getProductRecommendation(query, {
        sessionId,
        maxResults: 5
      });
      
      // Clear the "thinking" message
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      
      // Display assistant response
      console.log(chalk.green('Assistant: ') + result.response + '\n');
      
      // Display product recommendations if available
      if (result.products && result.products.length > 0) {
        console.log(chalk.magenta('Product Recommendations:'));
        result.products.forEach((product, index) => {
          console.log(chalk.bold(`${index + 1}. ${product.title}`));
          console.log(chalk.gray(`   Price: $${product.price.amount.toFixed(2)}`));
          
          // Display product attributes if available
          if (product.attributes.eyewear.frameShape) {
            console.log(chalk.gray(`   Frame Shape: ${product.attributes.eyewear.frameShape}`));
          }
          if (product.attributes.eyewear.frameMaterial) {
            console.log(chalk.gray(`   Material: ${product.attributes.eyewear.frameMaterial}`));
          }
          console.log('');
        });
      }
      
      // Display suggested queries if available
      if (result.suggestedQueries && result.suggestedQueries.length > 0) {
        console.log(chalk.yellow('Suggested questions:'));
        result.suggestedQueries.forEach((suggested, index) => {
          console.log(chalk.gray(`- ${suggested}`));
        });
        console.log('');
      }
      
    } catch (error) {
      // Clear the "thinking" message if there was an error
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      
      console.error(chalk.red('Error: ') + error.message);
      logger.error('Demo error:', error);
    }
    
    // Prompt for next question
    promptUser();
  });
}

// Start the interaction
promptUser();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\nThank you for using the Vertex AI Shopping Assistant Demo!'));
  rl.close();
  process.exit(0);
});
