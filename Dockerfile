FROM node:18-alpine

WORKDIR /app

RUN npm install -g http-server

COPY . .

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 8080

CMD ["http-server", ".", "-p", "8080", "-c-1"]
