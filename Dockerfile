FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Install wrangler globally for deployment
RUN npm install -g wrangler

# Create deployment script
RUN echo '#!/bin/sh\nset -e\necho "Deploying with API token: ${CLOUDFLARE_API_TOKEN:0:10}..."\nwrangler pages deploy dist --project-name=austinmovefinder' > /app/deploy.sh
RUN chmod +x /app/deploy.sh

# Expose port for potential local serving
EXPOSE 5173

CMD ["./deploy.sh"]