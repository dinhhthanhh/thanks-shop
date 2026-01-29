# Backend Dockerfile
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source
COPY . .

# Create upload directory and set permissions
RUN mkdir -p uploads/chat-attachments && chmod -R 777 uploads

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
