From node:lts-alpine

# Add user with home directory and switch to home directory
RUN adduser -D -h /home/prvuser prvuser
WORKDIR /home/prvuser

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Switch user to prvuser
USER prvuser

# Copy source code ignore node_modules
COPY . .

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["npm", "start"]