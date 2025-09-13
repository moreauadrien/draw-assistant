# ---------- Stage 1: Build Vite frontend ----------
FROM node:22-alpine3.21 AS frontend-build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /frontend

COPY frontend/package*.json ./
RUN pnpm i
COPY frontend/ .
RUN pnpm run build

# ---------- Stage 2: Python runtime ----------
FROM python:3.12-slim AS runtime

WORKDIR /backend

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

COPY --from=frontend-build /frontend/dist ./dist

EXPOSE 8000
ENTRYPOINT ["fastapi", "run", "main.py"]
