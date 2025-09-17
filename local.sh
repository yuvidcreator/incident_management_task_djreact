#! /bin/bash
set -e

# git pull origin main

sudo chown -cR $USER:$USER .
sudo chown -cR $USER:$USER .*


# docker compose up

docker compose up -d --build

docker compose exec incident_manage_dev_api sh -c "python manage.py makemigrations && python manage.py migrate"