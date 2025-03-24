from flask_socketio import SocketIO, join_room, leave_room, emit
from flask import request
import redis
from lye_integration import lye_session_to_user
import json

redis_client = redis.Redis()
redis_client.config_set("appendonly", "no")
redis_client.config_set("save", "")

# Plans: Control YTM Webapp with another device (like a phone)

def socket_events(socketio):
    @socketio.on("connect")
    def connect(data):
        print("Connection")
        print(data)
        if data is None:
            print("No data attached to connection req")
            return
        if data["session"] is None:
            print("no session")
            return
        user = lye_session_to_user(data["session"])
        if user is None:
            print("Invalid or no lye session")
            emit("identification", {"intents":"error", "description":"needs_auth"}, room=request.sid)
            return
        emit("identification", {"intents":"authenticated"}, room=request.sid)
        room_id = user["id"]+"-musicroom"
        redis_client.set(request.sid, room_id)
        if(data["role"] != "host"):
            join_room(room_id)
        room_data = redis_client.get(room_id)
        if room_data is None:
            hostSid = None
            if (data["role"] == "host"):
                hostSid = request.sid
            redis_client.set(room_id, json.dumps({"host-sid":hostSid, "connected-devices":1}))
        else:
            rdata = json.loads(room_data)
            if data["role"] == "host":
                if rdata["host-sid"] is None:
                    rdata["host-sid"] = request.sid
                else:
                    emit("takeover", room=rdata["host-sid"])
                    rdata["host-sid"] = request.sid
            rdata["connected-devices"]+=1;
            redis_client.set(room_id, json.dumps(rdata))



        

    @socketio.on("update")
    def update(data):
        print("update")
        if data is None:
            print("No data")
            return
        if data["session"] is None:
            print("no session")
            return
        user = lye_session_to_user(data["session"])
        if user is None:
            print("Invalid or no lye session")
            emit("identification", {"intents":"error", "description":"needs_auth"}, room=request.sid)
            return
        rdata = redis_client.get(user["id"]+"-musicroom")
        if rdata is None:
            emit("identification", {"intents":"error", "description":"needs_auth"}, room=request.sid)
            return
        rdata = json.loads(rdata)
        if (request.sid == rdata["host-sid"]):
            print("Host update")
            data["data"]["uname"] = user["name"]
            emit("update", data["data"], room=user["id"]+"-musicroom")
        elif (rdata["host-sid"] is not None):
            print("Listener update")
            emit("update", data["data"], room=rdata["host-sid"])
        

    @socketio.on("disconnect")
    def disconnect():
        print("Disconnected device")
        userroom = redis_client.get(request.sid)
        if userroom is None:
            return
        rdata = redis_client.get(userroom)
        if rdata is None:
            return
        
        rdata = json.loads(rdata)
        rdata["connected-devices"]-=1
        if (rdata["connected-devices"] <= 0):
            redis_client.delete(userroom)
            redis_client.delete(request.sid)
            return
        
        hostRole = False
        if (request.sid == rdata["host-sid"]):
            rdata["host-sid"] = None
            hostRole = True
        redis_client.set(userroom, json.dumps(rdata))
        redis_client.delete(request.sid)
        emit("left", {"host":hostRole}, room=userroom)
