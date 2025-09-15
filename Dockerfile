# Use official Node.js 18 Alpine image as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy all source files
COPY . .

# Build the project (compile TypeScript and copy templates)
RUN npm run build

# Expose port (default 3000)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
