
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# after copying package.json
COPY .env .env

# Install application dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the TypeScript application
RUN npm run build

# Expose the port your Express app listens on
EXPOSE 5000

# Define the command to run the application
CMD ["npm", "start"]