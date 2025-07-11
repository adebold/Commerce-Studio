FROM python:3.9-slim

WORKDIR /app

# Install system dependencies, including PostgreSQL client libraries and Redis
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libffi-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    psycopg2-binary \
    redis \
    google-cloud-aiplatform

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# Run the application
CMD exec uvicorn src.api.main:app --host 0.0.0.0 --port ${PORT}
