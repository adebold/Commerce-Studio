FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build the application
RUN npm run build

# Expose the service port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the service
CMD ["npm", "start"]