from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from .models import Order, Client, Agent, OrderDocument
from .serializers import OrderSerializer, ClientSerializer, AgentSerializer

# --- AGENT ---


@api_view(['POST'])
def create_agent(request):
    serializer = AgentSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'status': 'success'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- CLIENT ---


@api_view(['POST'])
def create_or_update_client(request):
    phone = request.data.get('phone')
    try:
        client = Client.objects.get(phone=phone)
        serializer = ClientSerializer(client, data=request.data, partial=True)
    except Client.DoesNotExist:
        serializer = ClientSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
def get_client(request, phone):
    try:
        client = Client.objects.get(phone=phone)
        return Response(ClientSerializer(client).data)
    except Client.DoesNotExist:
        return Response(status=404)

# --- ORDER ---


@api_view(['POST'])
# We add MultiPartParser to handle file uploads
@parser_classes([JSONParser, MultiPartParser, FormParser])
def create_order(request):
    # 1. Save the Order Data
    serializer = OrderSerializer(data=request.data)
    if serializer.is_valid():
        order = serializer.save()

        # 2. Handle Extra Files (The "At most 5" logic)
        # Frontend sends files with key 'supporting_docs'
        files = request.FILES.getlist('supporting_docs')
        for f in files[:5]:  # Limit to first 5 just in case
            OrderDocument.objects.create(order=order, file=f)

        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


@api_view(['GET'])
def check_status(request, ticket_id):
    try:
        order = Order.objects.get(ticket_id=ticket_id)
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    except Order.DoesNotExist:
        return Response({"error": "Ticket not found"}, status=404)
