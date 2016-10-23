import os

import tornado.websocket
import tornado.ioloop
import tornado.web

import json

clients = []

lightstate = False;

class Handler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        print("new client")
        clients.append(self)
        self.write_message('{"lightstate":"'+("1" if lightstate else "0")+'","type":"control"}')

    def on_message(self, data):
        message = json.loads(data)
        if message["type"] == "on":
            turnOn()
        elif message["type"] == "off":
            turnOff()
        elif message["type"] == "validate":
            print(message)

    def on_close(self):
        print("a client left")
        clients.remove(self)

def turnOff():
    lightstate = False
    print("Off")
    for client in clients:
        client.write_message('{"lightstate":"0","type":"control"}')
def turnOn():
    lightstate = True
    print("On")
    for client in clients:
        client.write_message('{"lightstate":"1","type":"control"}')

class StaticHandler(tornado.web.StaticFileHandler):
    def parse_url_path(self, url_path):
        if not url_path or url_path.endswith('/'):
            url_path = url_path + 'index.html'
        return url_path


application = tornado.web.Application([
    (r"/websocket", Handler),
    (r"/(.*)", StaticHandler, {"path": os.getcwd()+"/www"})
])

try:
    print("server starting")
    application.listen(8888)
    tornado.ioloop.IOLoop.current().start()
except KeyboardInterrupt:
    print("server exited")
