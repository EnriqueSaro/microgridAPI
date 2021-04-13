import socket
import struct
import sys

# Create a TCP/IP socket
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# Bind the socket to the address given on the command line
server_name = 'localhost'
server_address = (server_name, 5_000)
print('starting up on {} port {}'.format(*server_address))
sock.bind(server_address)
sock.listen(1)

while True:
    print('waiting for a connection')
    connection, client_address = sock.accept()
    try:
        print('client connected:', client_address)
        while True:
            data = connection.recv(4)
            print(sys.getsizeof(data))
            pack = struct.unpack('hhhh',data)
            print(pack)
            print('received {!r}'.format(pack))            
    finally:
        print("end")
     #   connection.close()
     