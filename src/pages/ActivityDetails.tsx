import { useEffect, useRef } from "react"

import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Heart,
    MapPin,
    Users,
} from "lucide-react"

import { Link, useParams } from "react-router-dom"

import {
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"

import { getActivityById } from "../services/activityService"

import { useSavedActivity } from "../hooks/useSavedActivity"

import { useBooking } from "../hooks/useBooking"

import { useAuth } from "../context/AuthContext"

import { supabase } from "../lib/supabase"


const formatDate = (date: string): string => {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(new Date(date))
}


const formatTime = (date: string): string => {
    return new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date))
}


type Availability = {
    capacity: number
    confirmed_bookings: number
    places_remaining: number
    user_booked: boolean
}


const ActivityDetails = () => {
    const { activityId } = useParams<{
        activityId: string
    }>()

    const { user } = useAuth()

    const queryClient = useQueryClient()

    const viewTracked = useRef<string | null>(null)


    const {
        data: activity,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["activity", activityId],

        queryFn: () => {
            if (!activityId) {
                throw new Error("Activity ID is missing.")
            }

            return getActivityById(activityId)
        },

        enabled: Boolean(activityId),
    })


    const {
        data: availability,
        isLoading: isAvailabilityLoading,
        refetch: refetchAvailability,
    } = useQuery({
        queryKey: ["activity-availability", activityId],

        queryFn: async (): Promise<Availability> => {
            if (!activityId) {
                throw new Error("Activity ID is missing.")
            }

            const { data, error } = await supabase.rpc(
                "get_activity_availability",
                {
                    p_activity_id: activityId,
                },
            )

            if (error) {
                throw new Error(error.message)
            }

            if (!data || data.length === 0) {
                throw new Error(
                    "Unable to load activity availability.",
                )
            }

            return data[0] as Availability
        },

        enabled: Boolean(activityId),
    })


    const {
        isSaved,
        isLoading: isSavedLoading,
        isSaving,
        toggleSaved,
        error: saveError,
    } = useSavedActivity(activityId ?? "")


    const {
        booking,
        isBooking,
        error: bookingError,
        bookingId,
        resetBooking,
    } = useBooking()


    useEffect(() => {
        if (
            !user ||
            !activityId ||
            !activity ||
            viewTracked.current === activityId
        ) {
            return
        }

        viewTracked.current = activityId

        const trackView = async () => {
            const { error } = await supabase.rpc(
                "record_activity_view",
                {
                    p_activity_id: activityId,
                },
            )

            if (error) {
                console.error(
                    "Failed to track activity view:",
                    error,
                )

                viewTracked.current = null
            } else {
                await queryClient.invalidateQueries({
                    queryKey: ["recommendations", user.id],
                })
            }
        }

        void trackView()
    }, [
        activityId,
        activity,
        user,
        queryClient,
    ])


    if (isLoading) {
        return (
            <div className="space-y-8">
                <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                    <div className="aspect-16/7 animate-pulse bg-slate-200" />

                    <div className="space-y-5 p-6 sm:p-8">
                        <div className="h-8 w-2/3 animate-pulse rounded bg-slate-200" />

                        <div className="h-5 w-1/3 animate-pulse rounded bg-slate-200" />

                        <div className="h-24 animate-pulse rounded bg-slate-200" />
                    </div>
                </div>
            </div>
        )
    }


    if (isError || !activity) {
        return (
            <div className="mx-auto max-w-2xl py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <MapPin size={24} />
                </div>

                <h1 className="mt-5 text-2xl font-bold text-slate-900">
                    Activity not found
                </h1>

                <p className="mt-2 text-slate-500">
                    {error instanceof Error
                        ? error.message
                        : "This activity may no longer be available."}
                </p>

                <Link
                    to="/discover"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    <ArrowLeft size={17} />

                    Back to Discover
                </Link>
            </div>
        )
    }


    const capacity =
        availability?.capacity ?? activity.capacity

    const placesRemaining =
        availability?.places_remaining ?? activity.capacity

    const userHasBooked =
        availability?.user_booked === true ||
        Boolean(bookingId)

    const isFullyBooked =
        placesRemaining <= 0 &&
        !userHasBooked


    const handleSave = async () => {
        try {
            await toggleSaved()

            if (user) {
                await queryClient.invalidateQueries({
                    queryKey: [
                        "recommendations",
                        user.id,
                    ],
                })
            }
        } catch (error) {
            console.error(
                "Failed to update saved activity:",
                error,
            )
        }
    }


    const handleBooking = async () => {
        if (
            !activityId ||
            isBooking ||
            userHasBooked
        ) {
            return
        }

        if (placesRemaining <= 0) {
            return
        }

        resetBooking()

        const result = await booking(activityId)

        if (result) {
            await refetchAvailability()

            if (user) {
                await queryClient.invalidateQueries({
                    queryKey: [
                        "recommendations",
                        user.id,
                    ],
                })

                await queryClient.invalidateQueries({
                    queryKey: [
                        "bookings",
                        user.id,
                    ],
                })
            }

            await queryClient.invalidateQueries({
                queryKey: ["activities"],
            })
        }
    }


    return (
        <div className="space-y-6">

            <Link
                to="/discover"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
                <ArrowLeft size={17} />

                Back to Discover
            </Link>


            <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

                <div className="relative aspect-16/7 overflow-hidden bg-slate-100">

                    {activity.image_url ? (
                        <img
                            src={activity.image_url}
                            alt={activity.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-linear-to-br from-indigo-100 via-slate-100 to-slate-200">
                            <span className="text-lg font-semibold text-slate-400">
                                {activity.category.name}
                            </span>
                        </div>
                    )}

                    <div className="absolute bottom-5 left-5">
                        <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm">
                            {activity.category.name}
                        </span>
                    </div>

                </div>


                <div className="p-6 sm:p-8">

                    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">

                        <div>

                            <div className="flex items-start justify-between gap-5">

                                <div>

                                    <p className="text-sm font-semibold text-indigo-600">
                                        {activity.university.name}
                                    </p>

                                    <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                        {activity.title}
                                    </h1>

                                </div>


                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={
                                        isSavedLoading ||
                                        isSaving
                                    }
                                    aria-label={
                                        isSaved
                                            ? `Remove ${activity.title} from saved activities`
                                            : `Save ${activity.title}`
                                    }
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition ${
                                        isSaved
                                            ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-600"
                                    } ${
                                        isSaving
                                            ? "cursor-not-allowed opacity-60"
                                            : ""
                                    }`}
                                >
                                    <Heart
                                        size={20}
                                        fill={
                                            isSaved
                                                ? "currentColor"
                                                : "none"
                                        }
                                    />
                                </button>

                            </div>


                            {saveError && (
                                <p className="mt-3 text-sm text-red-600">
                                    {saveError instanceof Error
                                        ? saveError.message
                                        : "Unable to save this activity."}
                                </p>
                            )}


                            <div className="mt-7 grid gap-4 sm:grid-cols-2">

                                <div className="flex items-start gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <CalendarDays size={19} />
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-slate-400">
                                            Date
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {formatDate(
                                                activity.start_time,
                                            )}
                                        </p>
                                    </div>

                                </div>


                                <div className="flex items-start gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <Clock3 size={19} />
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-slate-400">
                                            Time
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {formatTime(
                                                activity.start_time,
                                            )}
                                            {" – "}
                                            {formatTime(
                                                activity.end_time,
                                            )}
                                        </p>
                                    </div>

                                </div>


                                <div className="flex items-start gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <MapPin size={19} />
                                    </div>

                                    <div>
                                        <p className="text-xs font-medium text-slate-400">
                                            Location
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {activity.venue_name ??
                                                "Location TBC"}
                                        </p>

                                        {activity.address && (
                                            <p className="mt-0.5 text-sm text-slate-500">
                                                {activity.address}
                                            </p>
                                        )}
                                    </div>

                                </div>


                                <div className="flex items-start gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                                        <Users size={19} />
                                    </div>

                                    <div>

                                        <p className="text-xs font-medium text-slate-400">
                                            Capacity
                                        </p>

                                        <p className="mt-1 text-sm font-semibold text-slate-900">
                                            {capacity} places
                                        </p>

                                        <p
                                            className={`mt-0.5 text-sm font-medium ${
                                                placesRemaining <= 0
                                                    ? "text-red-600"
                                                    : placesRemaining <= 5
                                                        ? "text-amber-600"
                                                        : "text-emerald-600"
                                            }`}
                                        >
                                            {isAvailabilityLoading
                                                ? "Checking availability..."
                                                : placesRemaining <= 0
                                                    ? "Fully booked"
                                                    : `${placesRemaining} places remaining`}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            <div className="mt-9 border-t border-slate-100 pt-8">

                                <h2 className="text-xl font-bold text-slate-900">
                                    About this activity
                                </h2>

                                <div className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                                    {activity.description}
                                </div>

                            </div>

                        </div>


                        <aside className="lg:sticky lg:top-6 lg:self-start">

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

                                <div className="flex items-end justify-between">

                                    <div>

                                        <p className="text-sm text-slate-500">
                                            Price
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-slate-900">
                                            {activity.price === 0
                                                ? "Free"
                                                : `£${activity.price.toFixed(
                                                    2,
                                                )}`}
                                        </p>

                                    </div>

                                    <span className="text-sm font-medium text-slate-500">
                                        {placesRemaining} places
                                    </span>

                                </div>


                                <div
                                    className={`mt-5 flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm ${
                                        isFullyBooked
                                            ? "text-red-600"
                                            : userHasBooked
                                                ? "text-emerald-600"
                                                : "text-slate-600"
                                    }`}
                                >

                                    <div className="flex items-center gap-2">

                                        <CheckCircle2
                                            size={17}
                                            className={
                                                isFullyBooked
                                                    ? "text-red-600"
                                                    : "text-emerald-600"
                                            }
                                        />

                                        <span>
                                            {userHasBooked
                                                ? "Booking confirmed"
                                                : isFullyBooked
                                                    ? "Fully booked"
                                                    : "Booking available"}
                                        </span>

                                    </div>

                                    {!userHasBooked &&
                                        !isFullyBooked && (
                                            <span className="font-semibold">
                                                {placesRemaining} left
                                            </span>
                                        )}

                                </div>


                                {bookingError && (
                                    <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                        {bookingError}
                                    </p>
                                )}


                                {userHasBooked ? (
                                    <div className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-50 px-5 py-3.5 text-sm font-semibold text-emerald-700">
                                        <CheckCircle2 size={18} />

                                        Booking confirmed
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleBooking}
                                        disabled={
                                            isBooking ||
                                            isAvailabilityLoading ||
                                            isFullyBooked
                                        }
                                        className={`mt-4 w-full rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4 ${
                                            isFullyBooked
                                                ? "cursor-not-allowed bg-slate-400"
                                                : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-100"
                                        } ${
                                            isBooking
                                                ? "cursor-not-allowed opacity-70"
                                                : ""
                                        }`}
                                    >
                                        {isBooking
                                            ? "Booking..."
                                            : isFullyBooked
                                                ? "Fully booked"
                                                : "Book this activity"}
                                    </button>
                                )}

                                <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                                    {userHasBooked
                                        ? "Your place has been confirmed."
                                        : isFullyBooked
                                            ? "There are currently no places remaining."
                                            : "Your booking will be confirmed immediately."}
                                </p>

                            </div>

                        </aside>

                    </div>

                </div>

            </article>

        </div>
    )
}


export default ActivityDetails