export type ActivityStatus =
    | "draft"
    | "published"
    | "cancelled"
    | "completed"

export interface ActivityCategory {
    id: string
    name: string
    description: string | null
    icon: string | null
}

export interface ActivityUniversity {
    id: string
    name: string
    city: string
    country: string
}

export interface Activity {
    id: string
    title: string
    description: string
    image_url: string | null

    category_id: string
    university_id: string
    organiser_id: string | null

    venue_name: string | null
    address: string | null
    city: string | null

    start_time: string
    end_time: string

    price: number
    capacity: number

    status: ActivityStatus

    created_at: string
    updated_at: string

    category: ActivityCategory
    university: ActivityUniversity
}