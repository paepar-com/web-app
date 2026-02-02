from rest_framework import serializers
from .models import Order


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        # This converts every field (ID, Status, Name) into JSON
        fields = '__all__'
