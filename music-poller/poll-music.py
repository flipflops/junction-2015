import requests
import json
import time
from mpd import MPDClient

playing = False
api_url = 'http://46.101.216.59:3000/api/state'
client = MPDClient()       # create client object
print("Connecting to MPD")
client.connect('localhost', 6600)  # connect to localhost:6600
print(" MPD Version is " +  client.mpd_version)           # print the mpd version
client.clear()
print(client.findadd('track', 'barry white'))        

while True:
    time.sleep(0.05)
    r = requests.get(api_url)
    print(r.text)
    if r.status_code == 200:
        status = json.loads(r.text)
        print(client.currentsong())
        if status['on'] == True and playing == False:
            client.play()
            playing = True
        elif not status['on']:
            client.stop()
            playing = False


