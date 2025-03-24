import requests
import config
s = requests.Session()

def lye_session_to_user(session, update_name=True):
    if session is None:
        return None
    user = s.get(config.LYE_SOFTWARE_IP + "/v2/user?session=" + session, headers={"lye-origin": "beta.langstudy.tech"}).json()
    if "error" in user:
        return user
    if "username" in user:
        user["name"] = user["username"]
    return user