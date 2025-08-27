FROM node:18-alpine

WORKDIR /app

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache openssl

# Fix SSL library link
RUN ln -s /usr/lib/libssl.so.3 /lib/libssl.so.3

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install all dependencies (needed for build)  
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Clean up dev dependencies after build
RUN npm prune --omit=dev

# Copy and setup entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of app directory to nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]




