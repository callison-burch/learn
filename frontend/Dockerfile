FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --legacy-peer-deps || true
COPY . .
RUN npm run build
CMD ["npm", "start"]
EXPOSE 3000
