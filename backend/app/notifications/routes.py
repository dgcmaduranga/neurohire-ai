from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from app.database import notifications_collection
from app.notifications.websocket import manager

router = APIRouter(prefix="/notifications", tags=["Notifications"])


class NotificationRequest(BaseModel):
    user_id: str
    title: str
    message: str
    type: str = "info"


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(user_id, websocket)

    try:
        await manager.send_to_user(
            user_id,
            {
                "type": "connected",
                "message": "Real-time notifications connected",
            },
        )

        while True:
            await websocket.receive_text()

    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)


@router.post("/send")
async def send_notification(request: NotificationRequest):
    notification = {
        "user_id": request.user_id,
        "title": request.title,
        "message": request.message,
        "type": request.type,
        "read": False,
        "created_at": datetime.utcnow(),
    }

    result = await notifications_collection.insert_one(notification)

    await manager.send_to_user(
        request.user_id,
        {
            "id": str(result.inserted_id),
            "title": request.title,
            "message": request.message,
            "type": request.type,
            "read": False,
        },
    )

    return {
        "status": "success",
        "message": "Notification sent",
        "notification_id": str(result.inserted_id),
    }


@router.get("/{user_id}")
async def get_notifications(user_id: str):
    notifications = await notifications_collection.find(
        {"user_id": user_id}
    ).sort("created_at", -1).to_list(50)

    for item in notifications:
        item["_id"] = str(item["_id"])

    return {
        "status": "success",
        "count": len(notifications),
        "notifications": notifications,
    }