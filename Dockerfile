
# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json ./
COPY package-lock.json ./

# Install any needed packages
RUN npm install

# Bundle app source
COPY . .

# Make port 80 available to the world outside this container
# (This is a generic expose, the docker-compose file will map specific ports)
EXPOSE 80

# Define environment variable
ENV NODE_ENV production

# Run the app when the container launches
# The actual command will be overridden by the docker-compose file
CMD [ "node", "core/api-server.js" ]
