FROM node:lts-alpine

# Add user and create user directory
RUN adduser -D -h /home/prvuser prvuser
WORKDIR /home/prvuser


# Copy package.json and install dependencies
COPY package.json .
COPY package-lock.json .
RUN npm ci

# Switch to prvuser
USER prvuser
# Copy the rest of the files

COPY . .
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
