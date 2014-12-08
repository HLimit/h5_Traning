import asyncore
from websocket import WebSocketServer


class BroadcastHandler(object):

	def __init__(self, conn):
		self.conn = conn

	def dispatch(self,data):
		#each session is a connection
		for session in self.conn.server.sessions:
			session.send(data)

if __name__ == "__main__":
	print "Starting WebSocket broadcast Server" 
	WebSocketServer(port=5000, handlers={"/broadcast": BroadcastHandler})
	asyncore.loop() 