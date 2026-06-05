from fastapi import APIRouter, Depends

from app.dashboard.service import get_dashboard_summary
from app.dependencies import get_current_user

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


@router.get("/summary")
async def dashboard_summary(
    current_user=Depends(get_current_user),
):
    print("\n")
    print("========================================")
    print("CURRENT USER FROM JWT TOKEN")
    print(current_user)
    print("========================================")
    print("\n")

    user_id = (
        current_user.get("_id")
        or current_user.get("id")
    )

    print(f"USER ID USED FOR DASHBOARD: {user_id}")

    summary = await get_dashboard_summary(user_id)

    return {
        "status": "success",
        "summary": summary,
    }