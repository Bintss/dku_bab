FROM python:3.10-slim

RUN apt-get update \
    && apt-get install -y default-mysql-client libmariadb-dev build-essential gcc pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install --upgrade pip
COPY requirements.txt /app/
RUN pip install -r requirements.txt

COPY . /app/