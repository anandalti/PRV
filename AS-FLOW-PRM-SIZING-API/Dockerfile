FROM node:lts-alpine
 
RUN adduser -D -h /home/sizingApiUser sizingApiUser
WORKDIR /home/sizingApiUser

# Copy package*.json files and local patches
COPY package*.json ./
COPY patches/ ./patches/

# Install app dependencies
RUN npm install -g npm

# If you are building your code for production
RUN npm ci --only=production
 
# Switch to the new user
USER sizingApiUser
 
# Copy the rest of the app
COPY . .
 
# Expose ports
EXPOSE 3000
EXPOSE 443
 
# Start the app
CMD [ "npm", "start" ]