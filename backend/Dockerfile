FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install ALL deps (including devDependencies for nodemon)
RUN npm install

# Copy app source code
COPY . .

# Make sure data folder exists
RUN mkdir -p /app/data

EXPOSE 3000

# Default command will run in dev mode with nodemon
CMD ["npm", "run", "dev"]
