import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    MapPin,
    Ticket,
    XCircle,
} from "lucide-react"

import { Link } from "react-router-dom"

import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"

import { useAuth } from "../context/AuthContext"

import { supabase } from "../lib/supabase"

type Booking = {
    id: string
    status: string
    created_at: string

    activity: {
        id: string
        title: string
        description: string | null
        image_url: string | null
        start_time: string
        end_time: string
        venue_name: string | null
        address: string | null
        price: number
    }
}

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

const Bookings = () => {
    const { user } = useAuth()

    const queryClient = useQueryClient()

    const {
        data: bookings,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["bookings", user?.id],

        queryFn: async (): Promise<Booking[]> => {
            if (!user) {
                return []
            }

            const { data, error } = await supabase
                .from("bookings")
                .select(
                    `
                    id,
                    status,
                    created_at,
                    activity:activities (
                        id,
                        title,
                        description,
                        image_url,
                        start_time,
                        end_time,
                        venue_name,
                        address,
                        price
                    )
                `,
                )
                .eq("user_id", user.id)
                .order("created_at", {
                    ascending: false,
                })

            if (error) {
                throw new Error(error.message)
            }

            return (data ?? []) as unknown as Booking[]
        },

        enabled: Boolean(user),
    })

    const cancelBookingMutation = useMutation({
        mutationFn: async (
            bookingId: string,
        ) => {
            const {
                data,
                error,
            } = await supabase.rpc(
                "cancel_booking",
                {
                    p_booking_id: bookingId,
                },
            )

            if (error) {
                throw new Error(error.message)
            }

            return data
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["bookings", user?.id],
            })

            await queryClient.invalidateQueries({
                queryKey: ["recommendations", user?.id],
            })

            await queryClient.invalidateQueries({
                queryKey: ["activities"],
            })
        },
    })

    const handleCancelBooking = (
        bookingId: string,
        activityTitle: string,
    ) => {
        const confirmed = window.confirm(
            `Are you sure you want to cancel your booking for "${activityTitle}"?`,
        )

        if (!confirmed) {
            return
        }

        cancelBookingMutation.mutate(
            bookingId,
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

                    <div className="mt-3 h-5 w-80 animate-pulse rounded bg-slate-200" />
                </div>

                <div className="space-y-4">
                    {[1, 2].map((item) => (
                        <div
                            key={item}
                            className="h-40 animate-pulse rounded-2xl bg-slate-200"
                        />
                    ))}
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="mx-auto max-w-2xl py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <Ticket size={24} />
                </div>

                <h1 className="mt-5 text-2xl font-bold text-slate-900">
                    Something went wrong
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    {error instanceof Error
                        ? error.message
                        : "Unable to load your bookings."}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <p className="text-sm font-semibold text-indigo-600">
                    Your plans
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    Bookings
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Activities you have booked through Out-ere.
                </p>
            </div>

            {!bookings || bookings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                        <Ticket size={25} />
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-slate-900">
                        No bookings yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Once you book an activity, your upcoming plans will
                        appear here.
                    </p>

                    <Link
                        to="/discover"
                        className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        Discover activities
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => {
                        const activity = booking.activity

                        const isConfirmed =
                            booking.status ===
                            "confirmed"

                        return (
                            <article
                                key={booking.id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                            >
                                <div className="grid lg:grid-cols-[240px_1fr]">
                                    <div className="aspect-video bg-slate-100 lg:aspect-auto">
                                        {activity.image_url ? (
                                            <img
                                                src={activity.image_url}
                                                alt={activity.title}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full min-h-48 items-center justify-center bg-linear-to-br from-indigo-100 to-slate-100">
                                                <Ticket
                                                    size={32}
                                                    className="text-indigo-300"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-5 sm:p-6">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-slate-900">
                                                    {activity.title}
                                                </h2>

                                                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                                    <MapPin size={16} />

                                                    <span>
                                                        {activity.venue_name ??
                                                            "Location TBC"}
                                                    </span>
                                                </div>
                                            </div>

                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                    isConfirmed
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-slate-100 text-slate-600"
                                                }`}
                                            >
                                                {isConfirmed ? (
                                                    <CheckCircle2 size={14} />
                                                ) : (
                                                    <XCircle size={14} />
                                                )}

                                                {isConfirmed
                                                    ? "Confirmed"
                                                    : booking.status}
                                            </span>
                                        </div>

                                        <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                                    <CalendarDays size={17} />
                                                </div>

                                                <div>
                                                    <p className="text-xs text-slate-400">
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
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                                    <Clock3 size={17} />
                                                </div>

                                                <div>
                                                    <p className="text-xs text-slate-400">
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
                                        </div>

                                        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                                            <Link
                                                to={`/discover/${activity.id}`}
                                                className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                                            >
                                                View activity
                                            </Link>

                                            {isConfirmed && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCancelBooking(
                                                            booking.id,
                                                            activity.title,
                                                        )
                                                    }
                                                    disabled={
                                                        cancelBookingMutation.isPending
                                                    }
                                                    className="inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {cancelBookingMutation.isPending
                                                        ? "Cancelling..."
                                                        : "Cancel booking"}
                                                </button>
                                            )}
                                        </div>

                                        {cancelBookingMutation.isError && (
                                            <p className="mt-3 text-sm text-red-600">
                                                {cancelBookingMutation.error instanceof
                                                Error
                                                    ? cancelBookingMutation.error.message
                                                    : "Unable to cancel booking."}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default Bookings