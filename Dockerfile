# Stage 1: Build the Vite app
FROM node:22-alpine AS build

WORKDIR /app

# Gemini API Key (injected into the JS bundle at build time by Vite)
ENV GEMINI_API_KEY=AIzaSyDVGfi_OZVPB5roJJ43vsSzMcMJh60U2D0

# Install dependencies first (better caching)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built files
COPY --from=build /app/dist /usr/share/nginx/html

# Cloud Run uses PORT env var (default 8080)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
