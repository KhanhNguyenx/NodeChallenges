# --------- STAGE 1: deps (cài đặt dependencies) ----------
FROM node:20-alpine AS deps
WORKDIR /app

# Cài tool cần thiết nếu dự án có native modules (tùy chọn)
# RUN apk add --no-cache python3 make g++ 

# Chỉ copy file manifest để tối ưu cache
COPY package*.json ./

# Cài dependencies (không cài devDeps)
RUN npm ci --omit=dev

# --------- STAGE 2: builder (build TypeScript -> JS) ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Copy toàn bộ mã nguồn và cài devDeps để build
COPY package*.json ./
RUN npm ci

# Copy source để build
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript ra thư mục dist
RUN npm run build

# --------- STAGE 3: runner (chỉ mang thứ cần để chạy) ----------
FROM node:20-alpine AS runner
WORKDIR /app

# Thiết lập biến môi trường an toàn
ENV NODE_ENV=production \
    PORT=3000

# Tạo user không phải root để tăng bảo mật
RUN addgroup -S nodejs && adduser -S node -G nodejs
USER node

# Copy node_modules production từ stage deps
COPY --from=deps /app/node_modules ./node_modules

# Copy file cần thiết từ builder
COPY --chown=node:node /app/dist ./dist
COPY --chown=node:node package*.json ./

# (Tùy chọn) Healthcheck đơn giản
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://127.0.0.1:' + (process.env.PORT||3000), r=>{process.exit(r.statusCode===200?0:1)}).on('error', ()=>process.exit(1))"

EXPOSE 3000

# Chạy app đã build
CMD ["node", "dist/index.js"]
