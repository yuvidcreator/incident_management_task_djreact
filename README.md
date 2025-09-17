Pull the code

make sure docker installed

in project root , find local.sh

make sure local.sh is executable

sudo chmod u+x local.sh

-- run below command

./local.sh

-- Image gets build including PG DB,

then run below commands ,

docker compose exec incident_manage_dev_api python manage.py makemigrations

docker compose exec incident_manage_dev_api python manage.py migrate

docker compose exec incident_manage_dev_api python manage.py createsuperuser

-- then enter username , email & password

-- to logs in docker app , run below commands

docker compose logs -f
