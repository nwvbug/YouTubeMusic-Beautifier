from flask_socketio import SocketIO, join_room, leave_room, emit
from flask import request
import redis
import json
import secrets

redis_client = redis.Redis()
redis_client.config_set("appendonly", "no")
redis_client.config_set("save", "")

def socket_events(socketio):
    @socketio.on("connect")
    def connect(data):
        print("Connection Established")
        

    @socketio.on("create_room")
    def create_room(data):
        print("create_room")
        room_id = secrets.randbelow(1000000)
        room_id = str(room_id).zfill(6)
        redis_client.set(room_id, json.dumps(data))
        join_room(room_id)
        emit("room_created", {"room_id": room_id}, room=room_id)

        

    @socketio.on("update")
    def update(data):
        print("update")
        
        

    @socketio.on("disconnect")
    def disconnect():
        print("Disconnected device")
       
