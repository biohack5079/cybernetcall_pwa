import asyncio
import json
import websockets

connected_clients = {}

async def handler(websocket, path):  # Add 'path' as an argument
    """Handles incoming WebSocket connections."""
    print(f"Client connected from path: {path}")
    try:
        async for message in websocket:
            data = json.loads(message)
            print(f"Received message: {data}")

            if data['type'] == 'register':
                device_id = data['deviceId']
                ngrok_url = data['ngrokUrl']
                connected_clients[device_id] = {'websocket': websocket, 'ngrokUrl': ngrok_url}
                print(f"Registered device: {device_id} with ngrok URL: {ngrok_url}")

                # Send friend list (example)
                friends = [
                    {'id': 'friend1', 'name': 'Friend 1', 'lastLogin': '2023-10-27'},
                    {'id': 'friend2', 'name': 'Friend 2', 'lastLogin': '2023-10-26'},
                ]
                await websocket.send(json.dumps({'type': 'friendList', 'friends': friends}))

            elif data['type'] == 'offer':
                # Forward offer to the intended recipient
                recipient_id = data.get('recipientId')  # Assuming you have a recipientId in the offer
                if recipient_id and recipient_id in connected_clients:
                    recipient_websocket = connected_clients[recipient_id]['websocket']
                    await recipient_websocket.send(json.dumps(data))
            elif data['type'] == 'answer':
                # Forward answer to the offerer
                recipient_id = data.get('recipientId')
                if recipient_id and recipient_id in connected_clients:
                    recipient_websocket = connected_clients[recipient_id]['websocket']
                    await recipient_websocket.send(json.dumps(data))
            elif data['type'] == 'candidate':
                # Forward candidate to the other peer
                recipient_id = data.get('recipientId')
                if recipient_id and recipient_id in connected_clients:
                    recipient_websocket = connected_clients[recipient_id]['websocket']
                    await recipient_websocket.send(json.dumps(data))
            else:
                print("Unknown message type:", data['type'])

    except websockets.exceptions.ConnectionClosedOK:
        print("Client disconnected normally")
    except websockets.exceptions.ConnectionClosedError as e:
        print(f"Client disconnected with error: {e}")
    except Exception as e:
        print(f"Error handling connection: {e}")
    finally:
        # Remove the client from the connected_clients dictionary when they disconnect
        for device_id, client_info in list(connected_clients.items()):
            if client_info['websocket'] == websocket:
                del connected_clients[device_id]
                print(f"Removed device: {device_id} from connected clients")
                break

async def main():
    """Starts the WebSocket server."""
    async with websockets.serve(handler, "localhost", 8765):
        print("WebSocket server started on ws://localhost:8765")
        await asyncio.Future()  # Keep the server running indefinitely

if __name__ == "__main__":
    asyncio.run(main())
