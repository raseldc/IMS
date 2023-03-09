from api.models import ProductPurchase
from api.serializer import PurchaseSerializer


def purchase_report(from_date, to_date):
    query = ProductPurchase.objects.raw("SELECT * FROM api_productpurchase WHERE created_date >= \'{}\' AND "
                                        "created_date <= \'{}\'".format(from_date,to_date))
    serializer = PurchaseSerializer(query, many=True).data
    return serializer
