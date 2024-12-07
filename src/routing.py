from django.urls import path
from . import consumers
 
websocket_urlpatterns = [
    path("ws/admin/meal_updates/", consumers.AdminMealCountConsumer.as_asgi()),
]