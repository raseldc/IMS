# from django_elasticsearch_dsl import Document
# from django_elasticsearch_dsl.registries import registry
#
# from api.models import Products
#
#
# @registry.register_document
# class ProductDocument(Document):
#     class Index:
#         # Name of the Elasticsearch index
#         name = 'products'
#         # See Elasticsearch Indices API reference for available settings
#         settings = {'number_of_shards': 1,
#                     'number_of_replicas': 0}
#
#     class Django:
#         model = Products  # The model associated with this Document
#
#         # The fields of the model you want to be indexed in Elasticsearch
#         fields = ['name', 'selling_price', 'purchase_price']