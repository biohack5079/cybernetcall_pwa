import asyncio
import json
import websockets

connected_clients = {}

async def handler(websocket):
    try:
        async for message in websocket:
            data = json.loads(message)
            print(f"Received: {data}")

            if data['type'] == 'register':
                connected_clients[data['deviceId']] = websocket
            elif data['type'] in ['offer', 'answer', 'candidate']:
                recipient_id = data.get('recipientId')
                if recipient_id and recipient_id in connected_clients:
                    await connected_clients[recipient_id].send(json.dumps(data))
    except:
        pass
    finally:
        for device_id, ws in list(connected_clients.items()):
            if ws == websocket:
                del connected_clients[device_id]
                break

async def main():
    async with websockets.serve(handler, "0.0.0.0", 8765):
        print("Signaling server running on ws://localhost:8765")
        await asyncio.Future()

if __name__ == "__main__":
    asyncio.run(main())

