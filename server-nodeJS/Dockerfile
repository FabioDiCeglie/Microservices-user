FROM node:14

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your app runs on
EXPOSE 3000

# Command to run your application
CMD ["node", "index.js"]
