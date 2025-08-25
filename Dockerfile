FROM node:18-alpine

WORKDIR /app

# Install security updates
RUN apk update && apk upgrade && apk add --no-cache openssl

# Fix SSL library link
RUN ln -s /usr/lib/libssl.so.3 /lib/libssl.so.3

# Copy package files first for better Docker layer caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000

ENTRYPOINT ["npm", "run", "start"]




