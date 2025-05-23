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
        host_sid = request.sid
        host_details = data["host_details"]
        host_details["host_sid"] = host_sid
        room_data = {
            "host_details": host_details,
            "current_playing": data["current_playing"],
            "connected_devices": [],
        }
        redis_client.set(room_id, json.dumps(room_data))
        redis_client.set(host_sid, json.dumps({"device_type": "host", "device_room_id": room_id}))

        redis_client.set(room_id, json.dumps(data))
        join_room(room_id)

        emit("room_created", {"room_id": room_id}, room=room_id)

    @socketio.on("join_music_room")
    def join_music_room(data):
        print("join_room")
        room_id = data["room_id"]
        raw = redis_client.get(room_id)
        if not raw:
            emit("room_not_found", {"message": "Room not found"})
            return

        room_data = json.loads(raw)
        if not room_data:
            emit("room_not_found", {"message": "Room not found"})
            return
        device_sid = request.sid
        device_details = data["device_details"]
        device_details["device_sid"] = device_sid
        device_details["device_room_id"] = room_id
        device_details["device_type"] = "client"
        redis_client.set(device_sid, json.dumps(device_details))
        print(room_data)
        if "connected_devices" not in room_data:
            room_data["connected_devices"] = []
        room_data["connected_devices"].append(device_details)
        redis_client.set(room_id, json.dumps(room_data))

        join_room(room=room_id, sid=request.sid)
        emit("room_joined", {"room_data": room_data}, room=room_id)
        emit("update", room_data["current_playing"], room=request.sid)

    @socketio.on("update")
    def update(data):
        # data sent on update: data["current_playing"] {"elapsed_time" "total_time", "song_identifier", "song_name", "song_artist", "song_album"}
        print("update")
        raw = redis_client.get(request.sid)
        if not raw:
            emit("Unauthorized", {"message": "Device not registered"}, room=request.sid)
            return
        device = json.loads(raw)

        if not device:
            emit("Unauthorized", {"message": "Device not registered"}, room=request.sid)
            return
        
        if device["device_type"] != "host":
            emit("Unauthorized", {"message": "Device not hosting"}, room=request.sid)
            return
        
        room_id = device["device_room_id"]
        room_data = json.loads(redis_client.get(room_id))

        if not room_data:
            emit("room_not_found", {"message": "Room not found"}, room=request.sid)
            return
        
        if not data["current_playing"]:
            emit("Invalid", {"message":"Invalid request body"}, room=request.sid)

        room_data["current_playing"] = data["current_playing"]
        print("Playing "+room_data["current_playing"]["song_name"]+" By "+room_data["current_playing"]["song_artist"] + "on" + room_data["host_details"]["host_device_type"])
        emit("update", data["current_playing"], room=room_id)
        

    
    @socketio.on("control")
    def control(data):
        print("control")
        

    @socketio.on("disconnect")
    def disconnect():
        print("Disconnected device")
        # lookup if client or host
        # if client, disconnect and inform group
        # if host, inform group and close group
       
