FROM lucj/nodejs_mongo
MAINTAINER Luc Juggery
ENV LAST_UPDATED 20150823T135000

# Copy src files
COPY . /app/

# Make sure node_modules is not copied over
# RUN rm -r node_modules

# Use /app working directory
WORKDIR /app

# Expose API port
ENV PORT 1337
EXPOSE 1337

# Build dependencies
RUN npm install

# Run application
CMD ["npm", "start"]
