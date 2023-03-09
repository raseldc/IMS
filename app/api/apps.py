from django.apps import AppConfig
# from elasticsearch_dsl.connections import connections

from pharmacy import settings


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

