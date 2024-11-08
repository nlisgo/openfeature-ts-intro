# Use an argument for the Node.js version
ARG node_version=20.18-alpine3.20

# Base stage with Node.js
FROM node:${node_version} AS base

# Create and set the working directory
RUN mkdir /app
WORKDIR /app

# Build stage
FROM base AS build

# Copy package files and install dependencies
COPY package.json yarn.lock tsconfig.json ./
RUN yarn install --frozen-lockfile

# Production stage
FROM base AS prod

# Copy node_modules from the build stage
COPY --from=build /app/node_modules ./node_modules

# Copy application source code
COPY src/ ./src/
COPY package.json tsconfig.json ./

# Expose the application port
EXPOSE 3000

CMD ["yarn", "start"]

FROM prod AS dev
CMD [ "yarn", "start:dev" ]
