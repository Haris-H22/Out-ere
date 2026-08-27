import { supabase } from "../lib/supabase"

export type OrganiserActivity = {
    id: string
    title: string
    description: string | null
    image_url: string | null
    start_time: string
    end_time: string
    venue_name: string | null
    address: string | null
    city: string | null
    price: number
    capacity: number
    category_id: string
    university_id: string
    organiser_id: string
    status: string
    created_at: string
    updated_at: string
    category_name?: string
    university_name?: string
    booking_count?: number
}

export type Category = {
    id: string
    name: string
}

export type University = {
    id: string
    name: string
}

export type CreateActivityInput = {
    title: string
    description: string
    image_url: string
    category_id: string
    university_id: string
    venue_name: string
    address: string
    city: string
    start_time: string
    end_time: string
    price: number
    capacity: number
}

async function getCurrentUser() {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error) {
        throw new Error(error.message)
    }

    if (!user) {
        throw new Error("You must be signed in.")
    }

    return user
}

export async function getOrganiserActivities(): Promise<
    OrganiserActivity[]
> {
    const user = await getCurrentUser()

    const { data, error } = await supabase
        .from("activities")
        .select(`
            id,
            title,
            description,
            image_url,
            start_time,
            end_time,
            venue_name,
            address,
            city,
            price,
            capacity,
            category_id,
            university_id,
            organiser_id,
            status,
            created_at,
            updated_at,
            categories (
                name
            ),
            universities (
                name
            )
        `)
        .eq("organiser_id", user.id)
        .order("start_time", {
            ascending: true,
        })

    if (error) {
        throw new Error(error.message)
    }

    const activities = data ?? []

    if (activities.length === 0) {
        return []
    }

    const activityIds = activities.map(
        (activity) => activity.id,
    )

    const { data: bookings, error: bookingsError } =
        await supabase
            .from("bookings")
            .select("activity_id")
            .in("activity_id", activityIds)
            .eq("status", "confirmed")

    if (bookingsError) {
        throw new Error(bookingsError.message)
    }

    const bookingCounts: Record<string, number> = {}

    for (const booking of bookings ?? []) {
        bookingCounts[booking.activity_id] =
            (bookingCounts[booking.activity_id] ?? 0) + 1
    }

    return activities.map((activity: any) => ({
        ...activity,
        category_name:
            activity.categories?.name ?? "Other",
        university_name:
            activity.universities?.name ?? "University",
        booking_count:
            bookingCounts[activity.id] ?? 0,
    }))
}

export async function getCategories(): Promise<Category[]> {
    const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name")

    if (error) {
        throw new Error(error.message)
    }

    return data ?? []
}

export async function getUniversities(): Promise<
    University[]
> {
    const { data, error } = await supabase
        .from("universities")
        .select("id, name")
        .order("name")

    if (error) {
        throw new Error(error.message)
    }

    return data ?? []
}

export async function createActivity(
    input: CreateActivityInput,
): Promise<OrganiserActivity> {
    const user = await getCurrentUser()

    const { data, error } = await supabase
        .from("activities")
        .insert({
            title: input.title,
            description: input.description,
            image_url: input.image_url || null,
            category_id: input.category_id,
            university_id: input.university_id,
            organiser_id: user.id,
            venue_name: input.venue_name,
            address: input.address,
            city: input.city,
            start_time: new Date(
                input.start_time,
            ).toISOString(),
            end_time: new Date(
                input.end_time,
            ).toISOString(),
            price: input.price,
            capacity: input.capacity,
            status: "published",
        })
        .select()
        .single()

    if (error) {
        throw new Error(error.message)
    }

    if (!data) {
        throw new Error(
            "The activity could not be created.",
        )
    }

    return data
}

export async function deleteActivity(
    activityId: string,
): Promise<void> {
    const user = await getCurrentUser()

    const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityId)
        .eq("organiser_id", user.id)

    if (error) {
        throw new Error(error.message)
    }
}

export async function cancelActivity(
    activityId: string,
): Promise<void> {
    const user = await getCurrentUser()

    const { error } = await supabase
        .from("activities")
        .update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
        })
        .eq("id", activityId)
        .eq("organiser_id", user.id)

    if (error) {
        throw new Error(error.message)
    }
}