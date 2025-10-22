# Use Node.js 18
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install -g serve
RUN npm install

# Copy everything else
COPY . .

# Build your React app
RUN npm run build

# Expose the Railway port
EXPOSE 8080

# Serve your build
CMD ["serve", "-s", "build", "-l", "8080"]
