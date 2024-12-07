application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            eventwebapi.routing.websocket_urlpatterns
        )
    ),
})
has context menu