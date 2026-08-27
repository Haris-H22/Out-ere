import {
    ArrowRight,
    Heart,
    MapPin,
} from "lucide-react"

import { Link } from "react-router-dom"

import {
    useQuery,
    useQueryClient,
} from "@tanstack/react-query"

import { useAuth } from "../context/AuthContext"

import { supabase } from "../lib/supabase"

type SavedActivity = {
    activity_id: string

    activity: {
        id: string
        title: string
        description: string | null
        image_url: string | null
        start_time: string
        end_time: string
        venue_name: string | null
        price: number
    }
}

const Saved = () => {
    const { user } = useAuth()

    const queryClient = useQueryClient()

    const {
        data: savedActivities,
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ["saved-activities", user?.id],

        queryFn: async (): Promise<SavedActivity[]> => {
            if (!user) {
                return []
            }

            const { data, error } = await supabase
                .from("saved_activities")
                .select(
                    `
                    activity_id,
                    activity:activities (
                        id,
                        title,
                        description,
                        image_url,
                        start_time,
                        end_time,
                        venue_name,
                        price
                    )
                `,
                )
                .eq("user_id", user.id)

            if (error) {
                throw new Error(error.message)
            }

            return (data ?? []) as unknown as SavedActivity[]
        },

        enabled: Boolean(user),
    })

    const removeSavedActivity = async (
        activityId: string,
    ) => {
        if (!user) {
            return
        }

        const { error } = await supabase
            .from("saved_activities")
            .delete()
            .eq("user_id", user.id)
            .eq("activity_id", activityId)

        if (error) {
            console.error(
                "Failed to remove saved activity:",
                error,
            )

            return
        }

        await queryClient.invalidateQueries({
            queryKey: ["saved-activities", user.id],
        })

        await queryClient.invalidateQueries({
            queryKey: [
                "saved-activity",
                user.id,
                activityId,
            ],
        })
    }

    if (isLoading) {
        return (
            <div className="space-y-8">
                <div>
                    <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />

                    <div className="mt-3 h-5 w-80 animate-pulse rounded bg-slate-200" />
                </div>

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                        >
                            <div className="aspect-video animate-pulse bg-slate-200" />

                            <div className="space-y-3 p-5">
                                <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />

                                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />

                                <div className="h-10 animate-pulse rounded bg-slate-200" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="mx-auto max-w-2xl py-20 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
                    <Heart size={24} />
                </div>

                <h1 className="mt-5 text-2xl font-bold text-slate-900">
                    Something went wrong
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    {error instanceof Error
                        ? error.message
                        : "Unable to load your saved activities."}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}

            <div>
                <p className="text-sm font-semibold text-indigo-600">
                    Your activities
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    Saved
                </h1>

                <p className="mt-2 text-sm text-slate-500">
                    Activities you want to come back to.
                </p>
            </div>

            {/* Empty state */}

            {!savedActivities ||
            savedActivities.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                        <Heart size={25} />
                    </div>

                    <h2 className="mt-5 text-lg font-bold text-slate-900">
                        Nothing saved yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        When you find an activity you like,
                        tap the heart icon to save it here.
                    </p>

                    <Link
                        to="/discover"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                    >
                        Discover activities

                        <ArrowRight size={17} />
                    </Link>
                </div>
            ) : (
                /* Activity grid */

                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {savedActivities.map((saved) => {
                        const activity = saved.activity

                        return (
                            <article
                                key={saved.activity_id}
                                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                            >
                                {/* Image */}

                                <div className="relative aspect-video overflow-hidden bg-slate-100">
                                    {activity.image_url ? (
                                        <img
                                            src={
                                                activity.image_url
                                            }
                                            alt={
                                                activity.title
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center bg-linear-to-br from-indigo-100 to-slate-100">
                                            <Heart
                                                size={28}
                                                className="text-indigo-300"
                                            />
                                        </div>
                                    )}

                                    {/* Remove saved */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeSavedActivity(
                                                activity.id,
                                            )
                                        }
                                        aria-label={`Remove ${activity.title} from saved activities`}
                                        className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm transition hover:text-red-600"
                                    >
                                        <Heart
                                            size={18}
                                            fill="currentColor"
                                        />
                                    </button>
                                </div>

                                {/* Content */}

                                <div className="p-5">
                                    <h2 className="text-lg font-bold text-slate-900">
                                        {activity.title}
                                    </h2>

                                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                                        <MapPin size={16} />

                                        <span>
                                            {activity.venue_name ??
                                                "Location TBC"}
                                        </span>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-sm font-semibold text-slate-900">
                                            {activity.price ===
                                            0
                                                ? "Free"
                                                : `£${activity.price.toFixed(
                                                    2,
                                                )}`}
                                        </span>

                                        <Link
                                            to={`/discover/${activity.id}`}
                                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
                                        >
                                            View

                                            <ArrowRight
                                                size={15}
                                            />
                                        </Link>
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

export default Saved