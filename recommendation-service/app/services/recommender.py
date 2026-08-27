from collections import defaultdict
from datetime import datetime, timezone
from typing import Any

from app.models.activity import Activity


# ============================================================
# Interaction weights
# ============================================================

INTERACTION_WEIGHTS = {
    "booking": 10.0,
    "save": 6.0,
    "view": 2.0,
}


# ============================================================
# Profile preference weights
# ============================================================

PROFILE_INTEREST_WEIGHT = 8.0

PROFILE_UNIVERSITY_WEIGHT = 5.0


# ============================================================
# Recommendation engine
# ============================================================

class RecommendationEngine:

    # ========================================================
    # Interaction preferences
    # ========================================================

    def build_category_preferences(
        self,
        interactions: list[dict[str, Any]],
        activity_categories: dict[str, str],
    ) -> dict[str, float]:
        """
        Build a user's category preference profile
        from views, saves and bookings.
        """

        preferences: dict[str, float] = defaultdict(float)

        for interaction in interactions:
            activity_id = interaction.get("activity_id")

            interaction_type = interaction.get(
                "interaction_type"
            )

            category_id = activity_categories.get(
                activity_id
            )

            if not category_id:
                continue

            weight = INTERACTION_WEIGHTS.get(
                interaction_type,
                0.0,
            )

            preferences[category_id] += weight

        return dict(preferences)

    # ========================================================
    # Profile preferences
    # ========================================================

    def build_profile_preferences(
        self,
        preference_row: dict[str, Any] | None,
    ) -> tuple[set[str], str | None]:
        """
        Extract the user's manually selected interests
        and university from user_preferences.
        """

        if not preference_row:
            return set(), None

        interest_category_ids = (
            preference_row.get(
                "interest_category_ids"
            )
            or []
        )

        university_id = preference_row.get(
            "university_id"
        )

        interest_ids = {
            str(category_id)
            for category_id in interest_category_ids
            if category_id
        }

        return interest_ids, university_id

    # ========================================================
    # Calculate score
    # ========================================================

    def calculate_score(
        self,
        activity: Activity,
        category_preferences: dict[str, float],
        popularity_score: float = 0.0,
        profile_interest_ids: set[str] | None = None,
        profile_university_id: str | None = None,
    ) -> float:
        """
        Calculate the recommendation score for one activity.

        Score is based on:

        1. Explicit profile interests
        2. Explicit university preference
        3. Previous interactions
        4. Popularity
        5. Recency
        6. Availability
        """

        score = 0.0

        profile_interest_ids = (
            profile_interest_ids or set()
        )

        # ----------------------------------------------------
        # 1. Explicit profile interest
        # ----------------------------------------------------

        if activity.category_id in profile_interest_ids:
            score += PROFILE_INTEREST_WEIGHT

        # ----------------------------------------------------
        # 2. University preference
        # ----------------------------------------------------

        if (
            profile_university_id
            and activity.university_id
            == profile_university_id
        ):
            score += PROFILE_UNIVERSITY_WEIGHT

        # ----------------------------------------------------
        # 3. Previous user behaviour
        # ----------------------------------------------------

        score += category_preferences.get(
            activity.category_id,
            0.0,
        )

        # ----------------------------------------------------
        # 4. Popularity
        # ----------------------------------------------------

        # Popularity is deliberately capped so that
        # popular activities cannot completely overpower
        # personal preferences.

        score += min(
            popularity_score * 0.25,
            5.0,
        )

        # ----------------------------------------------------
        # 5. Upcoming activity bonus
        # ----------------------------------------------------

        now = datetime.now(timezone.utc)

        activity_start = activity.start_time

        # Handle naive datetimes safely.
        if activity_start.tzinfo is None:
            activity_start = activity_start.replace(
                tzinfo=timezone.utc
            )

        seconds_until_activity = (
            activity_start - now
        ).total_seconds()

        days_until_activity = (
            seconds_until_activity / 86400
        )

        if 0 <= days_until_activity <= 3:
            score += 3.0

        elif 3 < days_until_activity <= 7:
            score += 2.0

        elif 7 < days_until_activity <= 14:
            score += 1.0

        # ----------------------------------------------------
        # 6. Availability
        # ----------------------------------------------------

        if activity.capacity > 0:
            score += 1.0

        return score

    # ========================================================
    # Recommendation reason
    # ========================================================

    def get_reason(
        self,
        activity: Activity,
        category_preferences: dict[str, float],
        profile_interest_ids: set[str] | None = None,
        profile_university_id: str | None = None,
    ) -> str:
        """
        Generate a human-readable explanation
        for why an activity was recommended.
        """

        profile_interest_ids = (
            profile_interest_ids or set()
        )

        # ----------------------------------------------------
        # Explicit interest
        # ----------------------------------------------------

        if activity.category_id in profile_interest_ids:
            return (
                f"Because you are interested in "
                f"{activity.category_name}"
            )

        # ----------------------------------------------------
        # Previous behaviour
        # ----------------------------------------------------

        interaction_score = category_preferences.get(
            activity.category_id,
            0.0,
        )

        if interaction_score >= 10:
            return (
                f"Because you frequently engage with "
                f"{activity.category_name} activities"
            )

        if interaction_score >= 6:
            return (
                f"Because you enjoy "
                f"{activity.category_name} activities"
            )

        if interaction_score >= 2:
            return (
                f"Based on your interest in "
                f"{activity.category_name}"
            )

        # ----------------------------------------------------
        # University
        # ----------------------------------------------------

        if (
            profile_university_id
            and activity.university_id
            == profile_university_id
        ):
            return (
                "Because this activity is at your university"
            )

        # ----------------------------------------------------
        # Generic fallback
        # ----------------------------------------------------

        return "You might be interested in this"

    # ========================================================
    # Rank activities
    # ========================================================

    def rank_activities(
        self,
        activities: list[Activity],
        category_preferences: dict[str, float],
        popularity: dict[str, float],
        profile_interest_ids: set[str] | None = None,
        profile_university_id: str | None = None,
    ) -> list[tuple[Activity, float]]:
        """
        Score and rank activities.
        """

        scored: list[
            tuple[Activity, float]
        ] = []

        for activity in activities:
            score = self.calculate_score(
                activity=activity,
                category_preferences=category_preferences,
                popularity_score=popularity.get(
                    activity.id,
                    0.0,
                ),
                profile_interest_ids=(
                    profile_interest_ids
                ),
                profile_university_id=(
                    profile_university_id
                ),
            )

            scored.append(
                (activity, score)
            )

        # Highest score first.
        #
        # For activities with the same score,
        # prefer the activity happening sooner.

        scored.sort(
            key=lambda item: (
                item[1],
                -self._timestamp(
                    item[0].start_time
                ),
            ),
            reverse=True,
        )

        return scored

    # ========================================================
    # Safe timestamp helper
    # ========================================================

    @staticmethod
    def _timestamp(value: datetime) -> float:
        if value.tzinfo is None:
            value = value.replace(
                tzinfo=timezone.utc
            )

        return value.timestamp()