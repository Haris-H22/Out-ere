import {
    CalendarDays,
    Heart,
    MapPin,
} from "lucide-react"

import { Link } from "react-router-dom"

import { useSavedActivity } from "../../hooks/useSavedActivity"

type Activity = {
    id: string
    title: string
    description: string | null
    image_url: string | null
    start_time: string
    end_time: string
    venue_name: string | null
    price: number
    category: {
        id: string
        name: string
    }
}

type ActivityCardProps = {
    activity: Activity
}

const formatDate = (date: string): string => {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
    }).format(new Date(date))
}

const formatTime = (date: string): string => {
    return new Intl.DateTimeFormat("en-GB", {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date))
}

const ActivityCard = ({
                          activity,
                      }: ActivityCardProps) => {
    const {
        isSaved,
        isLoading: isSavedLoading,
        isSaving,
        toggleSaved,
        error: saveError,
    } = useSavedActivity(activity.id)

    const handleSave = async (
        event: React.MouseEvent<HTMLButtonElement>,
    ) => {
        event.preventDefault()
        event.stopPropagation()

        try {
            await toggleSaved()
        } catch (error) {
            console.error(
                "Failed to update saved activity:",
                error,
            )
        }
    }

    return (
        <Link
            to={`/discover/${activity.id}`}
            className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
            {/* Image */}
            <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                {activity.image_url ? (
                    <img
                        src={activity.image_url}
                        alt={activity.title}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-linear-to-br from-indigo-100 via-slate-100 to-slate-200">
                        <span className="text-lg font-semibold text-slate-400">
                            {activity.category.name}
                        </span>
                    </div>
                )}

                {/* Category */}
                <div className="absolute bottom-4 left-4">
                    <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-sm">
                        {activity.category.name}
                    </span>
                </div>

                {/* Save button */}
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
                    className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition ${
                        isSaved
                            ? "text-indigo-600"
                            : "text-slate-600 hover:text-indigo-600"
                    } ${
                        isSavedLoading ||
                        isSaving
                            ? "cursor-not-allowed opacity-60"
                            : ""
                    }`}
                >
                    <Heart
                        size={19}
                        fill={
                            isSaved
                                ? "currentColor"
                                : "none"
                        }
                    />
                </button>
            </div>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900">
                    {activity.title}
                </h3>

                {/* Date */}
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays size={16} />

                    <span>
                        {formatDate(
                            activity.start_time,
                        )}
                    </span>
                </div>

                {/* Time */}
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <span className="flex h-4 w-4 items-center justify-center text-sm">
                        ◷
                    </span>

                    <span>
                        {formatTime(
                            activity.start_time,
                        )}{" "}
                        –{" "}
                        {formatTime(
                            activity.end_time,
                        )}
                    </span>
                </div>

                {/* Location */}
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                    <MapPin size={16} />

                    <span>
                        {activity.venue_name ??
                            "Location TBC"}
                    </span>
                </div>

                {/* Save error */}
                {saveError && (
                    <p className="mt-3 text-xs text-red-600">
                        {saveError instanceof Error
                            ? saveError.message
                            : "Unable to save activity."}
                    </p>
                )}

                {/* Footer */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-sm font-semibold text-slate-900">
                        {activity.price === 0
                            ? "Free"
                            : `£${activity.price.toFixed(
                                2,
                            )}`}
                    </span>

                    <span className="text-sm font-semibold text-slate-900 transition group-hover:text-indigo-600">
                        View →
                    </span>
                </div>
            </div>
        </Link>
    )
}

export default ActivityCard