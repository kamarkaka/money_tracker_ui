# Use an official Node.js image to build the app
FROM node:23.4.0-alpine3.20 AS builder

# Set working directory  inside the container
WORKDIR /app

# Copy package.json to install dependencies
COPY package.json /app

# Copy the rest of the project files into the container
COPY src /app/src
COPY static /app/static
COPY svelte.config.js /app
COPY tsconfig.json /app
COPY vite.config.ts /app
COPY .env /app

# Install the project dependencies
RUN npm install

# Build the Svelte app for production
RUN npm run build

# Use an official Node.js image to serve the app
FROM node:23.4.0-alpine3.20

WORKDIR /app

# Copy the build output from the first stage into the Node.js directory
COPY --from=builder /app/build /app
COPY --from=builder /app/node_modules /app/node_modules

# Expose port 4173 to serve the application
EXPOSE 4173

# Start Node.js when the container starts
CMD ["node", "/app/index.js"]
