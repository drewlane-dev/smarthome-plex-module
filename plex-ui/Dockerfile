FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine

COPY --from=build /app/dist/plex-ui/browser /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    add_header Access-Control-Allow-Origin * always; \
    add_header Access-Control-Allow-Methods "GET, OPTIONS" always; \
    add_header Access-Control-Allow-Headers "Origin, Content-Type, Accept" always; \
    \
    location ~* remoteEntry\\.json$ { \
        add_header Cache-Control "no-cache, no-store, must-revalidate" always; \
        add_header Access-Control-Allow-Origin * always; \
    } \
    \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
