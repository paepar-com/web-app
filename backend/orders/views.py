from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Order
from .serializers import OrderSerializer

# 1. The "Create Order" Endpoint (For the Form)


@api_view(['POST'])
def create_order(request):
    serializer = OrderSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# 2. The "Check Status" Endpoint (For the Tracker)


@api_view(['GET'])
def check_status(request, ticket_id):
    try:
        order = Order.objects.get(ticket_id=ticket_id)
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    except Order.DoesNotExist:
        return Response(
            {"error": "Ticket not found"},
            status=status.HTTP_404_NOT_FOUND
        )
