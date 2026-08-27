from dataclasses import dataclass
from datetime import datetime


@dataclass
class Activity:
    id: str
    title: str
    description: str | None
    image_url: str | None

    start_time: datetime
    end_time: datetime

    venue_name: str | None
    address: str | None

    price: float
    capacity: int

    category_id: str
    category_name: str

    university_id: str
    university_name: str