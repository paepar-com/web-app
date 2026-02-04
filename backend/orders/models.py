from django.db import models
from django.utils import timezone
import uuid

# --- 1. THE AGENT MODEL ---


class Agent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.EmailField()
    state_of_practice = models.CharField(max_length=100)
    is_licensed = models.BooleanField(default=False)

    # We store multi-select services as a list (JSON)
    services_offered = models.JSONField(default=list)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Agent: {self.full_name} ({self.state_of_practice})"

# --- 2. THE CLIENT MODEL (Unchanged) ---


class Client(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    residential_address = models.TextField()
    dob = models.DateField()
    state_of_origin = models.CharField(max_length=100)
    lga_of_origin = models.CharField(max_length=100)
    nationality = models.CharField(max_length=100, default='Nigerian')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.phone})"

# --- 3. THE ORDER MODEL (Updated Statuses) ---


class Order(models.Model):
    SERVICE_TYPES = [
        ('DL', 'Drivers License'),
        ('VEHICLE', 'Vehicle Papers'),
        ('INSPECTION', 'Car Inspection'),
    ]

    # The detailed status list you requested
    STATUS_CHOICES = [
        ('RECEIVED', 'Received (Payment Processing)'),
        ('VIO', 'Processing at VIO'),
        ('MVAA', 'Processing at MVAA'),
        ('READY', 'Ready for Delivery'),
        ('DELIVERED', 'Delivered'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    ticket_id = models.CharField(
        max_length=20, unique=True, editable=False)  # We set this in save()
    client = models.ForeignKey(
        Client, on_delete=models.CASCADE, related_name='orders')
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPES)

    # This stores the CURRENT status
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='RECEIVED')

    # --- Specific Fields (Abbreviated for clarity, same as before) ---
    dl_application_type = models.CharField(
        max_length=50, blank=True, null=True)
    blood_group = models.CharField(max_length=5, blank=True, null=True)
    genotype = models.CharField(max_length=5, blank=True, null=True)
    passport_photo = models.FileField(
        upload_to='passports/', blank=True, null=True)
    nin_slip = models.FileField(upload_to='documents/', blank=True, null=True)

    vehicle_paper_types = models.JSONField(default=list, blank=True, null=True)
    vehicle_transaction_type = models.CharField(
        max_length=50, blank=True, null=True)
    existing_documents_desc = models.TextField(blank=True, null=True)
    vehicle_details = models.TextField(blank=True, null=True)
    chassis_number = models.CharField(max_length=100, blank=True, null=True)

    inspection_type = models.CharField(max_length=50, blank=True, null=True)
    preferred_inspection_date = models.CharField(
        max_length=100, blank=True, null=True)

    delivery_method = models.CharField(max_length=20, blank=True, null=True)
    fee_acknowledged = models.BooleanField(default=False)
    signature_authorized = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # 1. Generate Ticket ID if new
        if not self.ticket_id:
            self.ticket_id = f"PADI-{str(uuid.uuid4())[:4].upper()}"

        # 2. Check if status changed to log it
        is_new = self._state.adding
        if not is_new:
            old_order = Order.objects.get(pk=self.pk)
            if old_order.status != self.status:
                OrderStatusHistory.objects.create(
                    order=self, status=self.status, notes="Status Updated")

        super().save(*args, **kwargs)

        # 3. Create initial log for new orders
        if is_new:
            OrderStatusHistory.objects.create(
                order=self, status=self.status, notes="Application Received")


# --- 4. NEW: ORDER HISTORY (The Timeline) ---
class OrderStatusHistory(models.Model):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name='history')
    status = models.CharField(max_length=50)
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.status} at {self.timestamp}"

# --- 5. NEW: MULTIPLE DOCUMENTS ---


class OrderDocument(models.Model):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name='documents')
    file = models.FileField(upload_to='supporting_docs/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
