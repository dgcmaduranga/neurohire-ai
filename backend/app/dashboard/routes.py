from fastapi import APIRouter, Depends, HTTPException, status

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
    try:
        user_id = (
            current_user.get("_id")
            or current_user.get("id")
        )

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User ID not found in token",
            )

        summary = await get_dashboard_summary(
            str(user_id)
        )

        return {
            "status": "success",
            "message": "Dashboard summary loaded successfully",
            "summary": summary,
        }

    except HTTPException:
        raise

    except Exception as e:
        print("\n========== DASHBOARD ERROR ==========")
        print(str(e))
        print("=====================================\n")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Dashboard error: {str(e)}",
        )