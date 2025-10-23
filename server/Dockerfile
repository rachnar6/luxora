FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Run npm install on its own line
RUN npm install --omit=dev --legacy-peer-deps
# Copy the rest of the code on a separate line
COPY . .
# Make sure this port matches your server.js (e.g., 5000)
EXPOSE 5000
CMD ["node", "server.js"]