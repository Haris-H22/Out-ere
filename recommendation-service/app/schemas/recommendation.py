from datetime import datetime

from pydantic import BaseModel


class Recommendation(BaseModel):

    id: str

    title: str

    description: str | None = None

    image_url: str | None = None

    start_time: datetime

    end_time: datetime

    venue_name: str | None = None

    address: str | None = None

    price: float

    capacity: int

    category_id: str

    category_name: str

    university_id: str

    university_name: str

    recommendation_score: float

    recommendation_reason: str


class RecommendationResponse(BaseModel):

    recommendations: list[Recommendation]