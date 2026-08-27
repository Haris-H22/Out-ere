import { supabase } from "../lib/supabase"

export type BookingResult = {
    bookingId: string
}

export async function bookActivity(
    activityId: string,
): Promise<BookingResult> {
    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
        throw new Error(userError.message)
    }

    if (!user) {
        throw new Error(
            "You must be signed in to book an activity.",
        )
    }

    const { data, error } = await supabase.rpc(
        "book_activity",
        {
            p_activity_id: activityId,
        },
    )

    if (error) {
        throw new Error(error.message)
    }

    if (!data) {
        throw new Error(
            "The booking could not be created.",
        )
    }

    return {
        bookingId: data,
    }
}