import { useState } from "react"
import { bookActivity } from "../services/bookingService"

type UseBookingResult = {
    booking: (activityId: string) => Promise<string | null>
    isBooking: boolean
    error: string | null
    bookingId: string | null
    resetBooking: () => void
}

export function useBooking(): UseBookingResult {
    const [isBooking, setIsBooking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [bookingId, setBookingId] = useState<string | null>(null)

    const booking = async (
        activityId: string,
    ): Promise<string | null> => {
        setIsBooking(true)
        setError(null)
        setBookingId(null)

        try {
            const result = await bookActivity(activityId)

            setBookingId(result.bookingId)

            return result.bookingId
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Something went wrong while creating your booking."

            setError(message)

            return null
        } finally {
            setIsBooking(false)
        }
    }

    const resetBooking = () => {
        setError(null)
        setBookingId(null)
    }

    return {
        booking,
        isBooking,
        error,
        bookingId,
        resetBooking,
    }
}