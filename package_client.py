import socket
import sys
import struct

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Connect the socket to the port where the server is listening
server_address = ('localhost', 5_000)
print('starting up on {} port {}'.format(*server_address))
sock.connect(server_address)
try:
    
    # Send data
    message = 'This'
    message2 = struct.pack('hhhh',1,2,3,4)
    my_bytes = bytearray(message,'utf-8')

    print('sending {} '.format(message2))
    #print >>sys.stderr, 'sending "%s"' % message
    sock.send(message2) 

finally:
    print("end")
    #sock.close()