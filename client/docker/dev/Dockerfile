ARG NODE_VERSION=20-alpine
FROM node:${NODE_VERSION}

ARG APP_HOME=/app
WORKDIR ${APP_HOME}

RUN apk add --no-cache libc6-compat

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then npm install -g pnpm && pnpm install; \
    else echo "No lockfile found. Run yarn or npm install locally first." && exit 1; \
    fi

COPY . ${APP_HOME}

EXPOSE 3000

CMD ["yarn", "start"]
