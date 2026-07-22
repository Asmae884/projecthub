FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts --frozen-lockfile && npm cache clean --force
COPY . .
RUN npm run build
FROM nginx:alpine
RUN adduser -D -g '' appuser \
    && chown -R appuser:appuser /usr/share/nginx/html
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=appuser:appuser /app/build /usr/share/nginx/html
USER appuser

EXPOSE 80 5173

CMD ["nginx", "-g", "daemon off;"]