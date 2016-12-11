import os

import tornado.websocket
import tornado.ioloop
import tornado.web

import hashlib

import json
import random
import string
import sys

import importlib.util
try:
    importlib.util.find_spec('RPi.GPIO')
    import RPi.GPIO as GPIO
except ImportError:
        import FakeRPi.GPIO as GPIO

GPIO.setmode(GPIO.BCM)
light = 23
fan_low = 27
fan_mid = 17
fan_high = 22

clients = []
validClients = []

lightstate = False
password = open(r"password.txt", encoding="utf-8").read().strip()
secret = ''
def init():

    secret = getRandomString(100)

    GPIO.setup(23, GPIO.OUT)
    GPIO.setup(17, GPIO.OUT)
    GPIO.setup(27, GPIO.OUT)
    GPIO.setup(22, GPIO.OUT)


def veriToken(tok):
    a = tok.split('a')
    hashstr = a[0]
    tkstr = a[1]
    return hashlib.sha512((tkstr+secret).encode('UTF8')
                          ).hexdigest().replace('a', 'b') == hashstr


def getToken():
    s = getRandomString(30)
    return hashlib.sha512((s+secret).encode('UTF8')
                          ).hexdigest().replace('a', 'b')+'a'+s


def getRandomString(length):
    return (''.join(random.SystemRandom().choice(
            string.ascii_lowercase.replace('a', '') + string.digits
            ) for _ in range(length)))


def isValidated(client, tok):
    try:
        if veriToken(tok):
            validClients.append(client)
            return True
    except:
        print("Darn::"+tok)
    return False


class AuthHandler(tornado.web.RequestHandler):
    def prepare(self):
        if self.request.headers["Content-Type"].startswith("application/json"):
            print(self.request.body.decode('ascii'))
            self.json_args = json.loads(self.request.body.decode('ascii'))
        else:
            self.json_args = None

    def post(self):
        self.set_header("Content-Type", "text/plain")
        passwd = self.json_args['passwd']
        print(passwd+" : "+password)
        if(passwd == password):
            self.write(getToken())
        else:
            self.write('invalid passwd')


class PassHandle(tornado.web.RequestHandler):
    def get(self):
        self.write('petersucks69')


class Handler(tornado.websocket.WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        print("new client")
        clients.append(self)
        self.write_message('{"lightstate":"'+("1" if lightstate else "0") +
                           '","type":"control"}'
                           )

    def on_message(self, data):
        try:
            print(data)
            message = json.loads(data)
            print(message)
            if isValidated(self, message["tok"]):
                if message["type"] == "on":
                    turnOn()
                elif message["type"] == "off":
                    turnOff()
                elif message["type"] == "fan_off":
                    GPIO.output(fan_low, GPIO.LOW)
                    GPIO.output(fan_mid, GPIO.LOW)
                    GPIO.output(fan_high, GPIO.LOW)
                    for client in clients:
                        client.write_message('{"fanstate":"0","type":"fan"}')
                elif message["type"] == "fan_low":
                    GPIO.output(fan_low, GPIO.HIGH)
                    GPIO.output(fan_mid, GPIO.HIGH)
                    GPIO.output(fan_high, GPIO.LOW)
                    for client in clients:
                        client.write_message('{"fanstate":"1","type":"fan"}')
                elif message["type"] == "fan_mid":
                    GPIO.output(fan_low, GPIO.LOW)
                    GPIO.output(fan_mid, GPIO.HIGH)
                    GPIO.output(fan_high, GPIO.LOW)
                    for client in clients:
                        client.write_message('{"fanstate":"2","type":"fan"}')
                elif message["type"] == "fan_high":
                    GPIO.output(fan_low, GPIO.LOW)
                    GPIO.output(fan_mid, GPIO.LOW)
                    GPIO.output(fan_high, GPIO.HIGH)
                    for client in clients:
                        client.write_message('{"fanstate":"3","type":"fan"}')
                elif message["type"] == "check":
                    self.write_message('{"lightstate":"' + ('0' if lightstate
                                       else '0') + '","type":"valid"}')
                elif message["type"] == "signout":
                    validClients.remove(self)
            else:
                self.write_message('{"type":"tokenrejected"}')
        except Exception:
            print("an error has occured")

    def on_close(self):
        print("a client left")
        clients.remove(self)
        if self in validClients:
            validClients.remove(self)


def turnOff():
    GPIO.output(light, GPIO.HIGH)
    lightstate = False
    print("Off")
    for client in clients:
        client.write_message('{"lightstate":"0","type":"control"}')


def turnOn():
    GPIO.output(light, GPIO.LOW)
    lightstate = True
    print("On")
    for client in clients:
        client.write_message('{"lightstate":"1","type":"control"}')


class StaticHandler(tornado.web.StaticFileHandler):
    def parse_url_path(self, url_path):
        if not url_path or url_path.endswith('/'):
            url_path = url_path + 'index.html'
        return url_path

init()
application = tornado.web.Application([
    (r"/password", PassHandle),
    (r"/auth", AuthHandler),
    (r"/websocket", Handler),
    (r"/(.*)", StaticHandler, {"path": os.getcwd()+"/www"}),
])

try:
    print("server starting")
    application.listen(8000)
    tornado.ioloop.IOLoop.current().start()
except KeyboardInterrupt:
    print("server exited")
