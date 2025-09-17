FROM python:3.12-slim

ENV APP_HOME=/app
RUN mkdir -p $APP_HOME
RUN mkdir -p $APP_HOME/staticfiles
RUN mkdir -p $APP_HOME/mediafiles
WORKDIR $APP_HOME


LABEL maintainer="yuvraajlimbole@gmail.com"
LABEL description="Django-React Full Stack App - Dev Boilerplate"


ENV PYTHONDONTWRITEBYTECODE=1

ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gettext \
    netcat-openbsd \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# set user without root access
RUN useradd -r wmds
# RUN adduser -D wmds
# WORKDIR /home/wmds

COPY  ./requirements.txt ${APP_HOME}

RUN pip3 install --no-cache-dir --upgrade pip

RUN pip3 install --no-cache-dir -r requirements.txt


COPY ./docker/dev/django/entrypoint /entrypoint
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint

COPY ./docker/dev/django/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

COPY ./docker/dev/django/celery/worker/start /start-celeryworker
RUN sed -i 's/\r$//g' /start-celeryworker
RUN chmod +x /start-celeryworker

COPY ./docker/dev/django/celery/flower/start /start-flower
RUN sed -i 's/\r$//g' /start-flower
RUN chmod +x /start-flower

ENTRYPOINT ["/entrypoint"]