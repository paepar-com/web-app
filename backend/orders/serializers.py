from rest_framework import serializers
from .models import Order, Client, Agent, OrderStatusHistory


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = '__all__'


class AgentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = '__all__'


class HistorySerializer(serializers.ModelSerializer):
    timestamp = serializers.DateTimeField(format="%d/%m/%Y")
    # This magic line gets the readable text (e.g. "Processing at VIO")
    status = serializers.SerializerMethodField()

    class Meta:
        model = OrderStatusHistory
        fields = ['status', 'timestamp', 'notes']

    def get_status(self, obj):
        # We try to match the status string to the Order choices to get the label
        # If it's a custom note, we just return the status text as is.
        for code, label in Order.STATUS_CHOICES:
            if code == obj.status:
                return label
        return obj.status


class OrderSerializer(serializers.ModelSerializer):
    client = ClientSerializer(read_only=True)
    client_phone = serializers.CharField(write_only=True)
    history = HistorySerializer(many=True, read_only=True)

    # New Field: This sends "Processing at VIO" instead of "VIO"
    status_display = serializers.CharField(
        source='get_status_display', read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

    def create(self, validated_data):
        phone = validated_data.pop('client_phone')
        try:
            client = Client.objects.get(phone=phone)
        except Client.DoesNotExist:
            raise serializers.ValidationError(
                {"client_phone": "Client info not found. Please fill Primary Info first."})

        return Order.objects.create(client=client, **validated_data)
