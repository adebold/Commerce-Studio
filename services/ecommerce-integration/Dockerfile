# Use an official Node.js runtime as a parent image
FROM node:18-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application's source code
COPY . .

# Make port 3003 available to the world outside this container
EXPOSE 3003

# Run the app when the container launches
CMD ["node", "src/server.js"]