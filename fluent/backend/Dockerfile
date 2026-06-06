# ── Stage 1: Build ──
FROM python:3.12-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends gcc && \
    rm -rf /var/lib/apt/lists/*

COPY pyproject.toml .
COPY app app
RUN pip install --no-cache-dir --prefix=/install .

COPY . .

# ── Stage 2: Runtime ──
FROM python:3.12-slim AS runtime

LABEL maintainer="Fluent Team"
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

RUN addgroup --system app && adduser --system --ingroup app app

COPY --from=builder /install /usr/local
COPY --from=builder /build /app

RUN chown -R app:app /app
# USER app

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
