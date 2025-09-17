"""
ASGI config for coreAPI project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
from coreAPI.settings.base import env

from django.core.asgi import get_asgi_application

# os.environ.setdefault("DJANGO_SETTINGS_MODULE", "coreAPI.settings")
if env("DEV_PAHSE")=="dev":
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'coreAPI.settings.development')
else:
    print("Prodcution py set")
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'coreAPI.settings.production')

application = get_asgi_application()
