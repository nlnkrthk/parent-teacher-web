# Build stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json .

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm install

# Copy built assets from build stage
COPY . .

# Copy nginx configuration if you have any custom config
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 5173

# Start nginx
CMD [ "npm","run","dev" ]