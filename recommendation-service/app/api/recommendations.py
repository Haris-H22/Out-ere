from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from app.database.supabase import supabase
from app.models.activity import Activity
from app.schemas.recommendation import (
    Recommendation,
    RecommendationResponse,
)
from app.services.recommender import (
    INTERACTION_WEIGHTS,
    RecommendationEngine,
)

router = APIRouter(
    prefix="/recommendations",
    tags=["Recommendations"],
)

engine = RecommendationEngine()


@router.get(
    "/{user_id}",
    response_model=RecommendationResponse,
)
async def get_recommendations(
    user_id: str,
):
    try:
        interactions_response = (
            supabase
            .table("activity_interactions")
            .select(
                "activity_id, interaction_type, created_at"
            )
            .eq("user_id", user_id)
            .execute()
        )

        if interactions_response is None:
            raise RuntimeError(
                "Supabase returned no response for activity interactions."
            )

        interactions = (
            interactions_response.data or []
        )

        preferences_response = (
            supabase
            .table("user_preferences")
            .select(
                "university_id, interest_category_ids"
            )
            .eq("user_id", user_id)
            .limit(1)
            .execute()
        )

        if preferences_response is None:
            raise RuntimeError(
                "Supabase returned no response for user preferences."
            )

        preference_rows = (
            preferences_response.data or []
        )

        preference_row = (
            preference_rows[0]
            if preference_rows
            else None
        )

        (
            profile_interest_ids,
            profile_university_id,
        ) = engine.build_profile_preferences(
            preference_row
        )

        now = datetime.now(
            timezone.utc
        ).isoformat()

        activities_response = (
            supabase
            .table("activities")
            .select(
                """
                id,
                title,
                description,
                image_url,
                start_time,
                end_time,
                venue_name,
                address,
                price,
                capacity,
                category_id,
                university_id
                """
            )
            .eq("status", "published")
            .gt(
                "start_time",
                now,
            )
            .execute()
        )

        if activities_response is None:
            raise RuntimeError(
                "Supabase returned no response for activities."
            )

        activity_rows = (
            activities_response.data or []
        )

        categories_response = (
            supabase
            .table("categories")
            .select("id, name")
            .execute()
        )

        if categories_response is None:
            raise RuntimeError(
                "Supabase returned no response for categories."
            )

        categories = {
            row["id"]: row["name"]
            for row in (
                categories_response.data or []
            )
        }

        universities_response = (
            supabase
            .table("universities")
            .select("id, name")
            .execute()
        )

        if universities_response is None:
            raise RuntimeError(
                "Supabase returned no response for universities."
            )

        universities = {
            row["id"]: row["name"]
            for row in (
                universities_response.data or []
            )
        }

        activity_categories = {
            row["id"]: row["category_id"]
            for row in activity_rows
        }

        category_preferences = (
            engine.build_category_preferences(
                interactions=interactions,
                activity_categories=activity_categories,
            )
        )

        bookings_response = (
            supabase
            .table("bookings")
            .select("activity_id")
            .eq("user_id", user_id)
            .eq("status", "confirmed")
            .execute()
        )

        if bookings_response is None:
            raise RuntimeError(
                "Supabase returned no response for bookings."
            )

        booked_activity_ids = {
            row["activity_id"]
            for row in (
                bookings_response.data or []
            )
        }

        activities: list[Activity] = []

        for row in activity_rows:
            if row["id"] in booked_activity_ids:
                continue

            category_id = row["category_id"]
            university_id = row["university_id"]

            activity = Activity(
                id=row["id"],
                title=row["title"],
                description=row.get(
                    "description"
                ),
                image_url=row.get(
                    "image_url"
                ),
                start_time=datetime.fromisoformat(
                    row["start_time"].replace(
                        "Z",
                        "+00:00",
                    )
                ),
                end_time=datetime.fromisoformat(
                    row["end_time"].replace(
                        "Z",
                        "+00:00",
                    )
                ),
                venue_name=row.get(
                    "venue_name"
                ),
                address=row.get(
                    "address"
                ),
                price=float(
                    row.get("price") or 0
                ),
                capacity=int(
                    row.get("capacity") or 0
                ),
                category_id=category_id,
                category_name=categories.get(
                    category_id,
                    "Other",
                ),
                university_id=university_id,
                university_name=universities.get(
                    university_id,
                    "University",
                ),
            )

            activities.append(activity)

        popularity_response = (
            supabase
            .table("activity_interactions")
            .select(
                "activity_id, interaction_type"
            )
            .execute()
        )

        if popularity_response is None:
            raise RuntimeError(
                "Supabase returned no response for popularity data."
            )

        popularity: dict[str, float] = {}

        for interaction in (
            popularity_response.data or []
        ):
            activity_id = interaction[
                "activity_id"
            ]

            interaction_type = interaction[
                "interaction_type"
            ]

            weight = INTERACTION_WEIGHTS.get(
                interaction_type,
                0.0,
            )

            popularity[activity_id] = (
                popularity.get(
                    activity_id,
                    0.0,
                )
                + weight
            )

        ranked = engine.rank_activities(
            activities=activities,
            category_preferences=(
                category_preferences
            ),
            popularity=popularity,
            profile_interest_ids=(
                profile_interest_ids
            ),
            profile_university_id=(
                profile_university_id
            ),
        )

        if (
            not interactions
            and not profile_interest_ids
            and not profile_university_id
        ):
            ranked = sorted(
                ranked,
                key=lambda item: (
                    popularity.get(
                        item[0].id,
                        0.0,
                    ),
                    -engine._timestamp(
                        item[0].start_time
                    ),
                ),
                reverse=True,
            )

        ranked = ranked[:6]

        recommendations = []

        for activity, score in ranked:
            reason = engine.get_reason(
                activity=activity,
                category_preferences=(
                    category_preferences
                ),
                profile_interest_ids=(
                    profile_interest_ids
                ),
                profile_university_id=(
                    profile_university_id
                ),
            )

            recommendations.append(
                Recommendation(
                    id=activity.id,
                    title=activity.title,
                    description=activity.description,
                    image_url=activity.image_url,
                    start_time=activity.start_time,
                    end_time=activity.end_time,
                    venue_name=activity.venue_name,
                    address=activity.address,
                    price=activity.price,
                    capacity=activity.capacity,
                    category_id=activity.category_id,
                    category_name=activity.category_name,
                    university_id=activity.university_id,
                    university_name=activity.university_name,
                    recommendation_score=round(
                        score,
                        2,
                    ),
                    recommendation_reason=reason,
                )
            )

        return RecommendationResponse(
            recommendations=recommendations
        )

    except Exception as error:
        import traceback

        print(
            "Recommendation error:",
            error,
        )

        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate "
                "recommendations."
            ),
        )