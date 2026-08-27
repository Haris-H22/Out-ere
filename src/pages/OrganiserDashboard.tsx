import {
    CalendarDays,
    CheckCircle2,
    Clock,
    Plus,
    Ticket,
    Trash2,
    XCircle,
} from "lucide-react"

import { useMemo, useState } from "react"

import {
    createActivity,
    deleteActivity,
    getCategories,
    getOrganiserActivities,
    getUniversities,
    cancelActivity,
    type Category,
    type University,
    type OrganiserActivity,
} from "../services/organiserService"

import { useQuery, useQueryClient } from "@tanstack/react-query"

const OrganiserDashboard = () => {
    const queryClient = useQueryClient()

    const [showCreateForm, setShowCreateForm] =
        useState(false)

    const [isCreating, setIsCreating] =
        useState(false)

    const [error, setError] =
        useState<string | null>(null)

    const [success, setSuccess] =
        useState<string | null>(null)

    const [form, setForm] = useState({
        title: "",
        description: "",
        image_url: "",
        category_id: "",
        university_id: "",
        venue_name: "",
        address: "",
        city: "",
        start_time: "",
        end_time: "",
        price: "0",
        capacity: "20",
    })

    const activitiesQuery = useQuery<
        OrganiserActivity[]
    >({
        queryKey: ["organiser", "activities"],
        queryFn: getOrganiserActivities,
    })

    const categoriesQuery = useQuery<Category[]>({
        queryKey: ["categories"],
        queryFn: getCategories,
    })

    const universitiesQuery =
        useQuery<University[]>({
            queryKey: ["universities"],
            queryFn: getUniversities,
        })

    const activities =
        activitiesQuery.data ?? []

    const stats = useMemo(() => {
        const now = new Date()

        const upcoming = activities.filter(
            (activity) =>
                new Date(activity.start_time) > now &&
                activity.status === "published",
        )

        const totalBookings =
            activities.reduce(
                (total, activity) =>
                    total +
                    (activity.booking_count ?? 0),
                0,
            )

        const published = activities.filter(
            (activity) =>
                activity.status === "published",
        )

        return {
            total: activities.length,
            upcoming: upcoming.length,
            bookings: totalBookings,
            published: published.length,
        }
    }, [activities])

    const handleChange = (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = event.target

        setForm((current) => ({
            ...current,
            [name]: value,
        }))
    }

    const handleCreate = async (
        event: React.FormEvent,
    ) => {
        event.preventDefault()

        setError(null)
        setSuccess(null)
        setIsCreating(true)

        try {
            if (!form.title.trim()) {
                throw new Error(
                    "Please enter an activity title.",
                )
            }

            if (!form.category_id) {
                throw new Error(
                    "Please select a category.",
                )
            }

            if (!form.university_id) {
                throw new Error(
                    "Please select a university.",
                )
            }

            if (!form.start_time || !form.end_time) {
                throw new Error(
                    "Please select the start and end time.",
                )
            }

            if (
                new Date(form.end_time) <=
                new Date(form.start_time)
            ) {
                throw new Error(
                    "The end time must be after the start time.",
                )
            }

            await createActivity({
                title: form.title.trim(),
                description:
                    form.description.trim(),
                image_url: form.image_url.trim(),
                category_id:
                form.category_id,
                university_id:
                form.university_id,
                venue_name:
                    form.venue_name.trim(),
                address:
                    form.address.trim(),
                city: form.city.trim(),
                start_time:
                form.start_time,
                end_time:
                form.end_time,
                price:
                    Number(form.price) || 0,
                capacity:
                    Number(form.capacity) || 1,
            })

            setForm({
                title: "",
                description: "",
                image_url: "",
                category_id: "",
                university_id: "",
                venue_name: "",
                address: "",
                city: "",
                start_time: "",
                end_time: "",
                price: "0",
                capacity: "20",
            })

            setShowCreateForm(false)

            setSuccess(
                "Activity created successfully.",
            )

            await queryClient.invalidateQueries({
                queryKey: [
                    "organiser",
                    "activities",
                ],
            })
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to create activity.",
            )
        } finally {
            setIsCreating(false)
        }
    }

    const handleCancel = async (
        activityId: string,
    ) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this activity?",
        )

        if (!confirmed) {
            return
        }

        try {
            setError(null)

            await cancelActivity(activityId)

            await queryClient.invalidateQueries({
                queryKey: [
                    "organiser",
                    "activities",
                ],
            })
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to cancel activity.",
            )
        }
    }

    const handleDelete = async (
        activityId: string,
    ) => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this activity?",
        )

        if (!confirmed) {
            return
        }

        try {
            setError(null)

            await deleteActivity(activityId)

            await queryClient.invalidateQueries({
                queryKey: [
                    "organiser",
                    "activities",
                ],
            })
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to delete activity.",
            )
        }
    }

    if (activitiesQuery.isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-sm text-slate-500">
                    Loading organiser dashboard...
                </div>
            </div>
        )
    }

    if (activitiesQuery.isError) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                Unable to load your organiser
                dashboard.

                <p className="mt-2 text-sm">
                    {activitiesQuery.error instanceof
                    Error
                        ? activitiesQuery.error.message
                        : "Please try again."}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-8">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm font-semibold text-indigo-600">
                        Organiser dashboard
                    </p>

                    <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                        Manage your activities
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Create activities and keep track
                        of your bookings.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        setShowCreateForm(
                            (current) => !current,
                        )
                        setError(null)
                        setSuccess(null)
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                    <Plus size={18} />

                    Create activity
                </button>
            </div>

            {success && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <CheckCircle2 size={18} />

                    {success}
                </div>
            )}

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {error}
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={CalendarDays}
                    label="Total activities"
                    value={stats.total}
                />

                <StatCard
                    icon={Clock}
                    label="Upcoming"
                    value={stats.upcoming}
                />

                <StatCard
                    icon={Ticket}
                    label="Confirmed bookings"
                    value={stats.bookings}
                />

                <StatCard
                    icon={CheckCircle2}
                    label="Published"
                    value={stats.published}
                />
            </div>

            {showCreateForm && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900">
                            Create an activity
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Publish a new activity for
                            students to discover.
                        </p>
                    </div>

                    <form
                        onSubmit={handleCreate}
                        className="space-y-6"
                    >
                        <div className="grid gap-5 md:grid-cols-2">
                            <FormField
                                label="Activity title"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g. Student Football"
                                required
                            />

                            <FormField
                                label="Image URL"
                                name="image_url"
                                value={form.image_url}
                                onChange={handleChange}
                                placeholder="https://..."
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-900">
                                Description
                            </label>

                            <textarea
                                name="description"
                                value={
                                    form.description
                                }
                                onChange={handleChange}
                                rows={4}
                                placeholder="Tell students about the activity..."
                                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                            />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <SelectField
                                label="Category"
                                name="category_id"
                                value={
                                    form.category_id
                                }
                                onChange={handleChange}
                                options={
                                    categoriesQuery.data ??
                                    []
                                }
                                placeholder="Select category"
                            />

                            <SelectField
                                label="University"
                                name="university_id"
                                value={
                                    form.university_id
                                }
                                onChange={handleChange}
                                options={
                                    universitiesQuery.data ??
                                    []
                                }
                                placeholder="Select university"
                            />
                        </div>

                        <div className="grid gap-5 md:grid-cols-3">
                            <FormField
                                label="Venue"
                                name="venue_name"
                                value={
                                    form.venue_name
                                }
                                onChange={handleChange}
                                placeholder="Sports Hall"
                            />

                            <FormField
                                label="Address"
                                name="address"
                                value={
                                    form.address
                                }
                                onChange={handleChange}
                                placeholder="University Road"
                            />

                            <FormField
                                label="City"
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                placeholder="Birmingham"
                            />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <FormField
                                label="Start"
                                name="start_time"
                                type="datetime-local"
                                value={
                                    form.start_time
                                }
                                onChange={handleChange}
                                required
                            />

                            <FormField
                                label="End"
                                name="end_time"
                                type="datetime-local"
                                value={form.end_time}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid gap-5 md:grid-cols-2">
                            <FormField
                                label="Price (£)"
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={handleChange}
                            />

                            <FormField
                                label="Capacity"
                                name="capacity"
                                type="number"
                                min="1"
                                value={
                                    form.capacity
                                }
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowCreateForm(
                                        false,
                                    )
                                }
                                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={
                                    isCreating
                                }
                                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isCreating
                                    ? "Creating..."
                                    : "Create activity"}
                            </button>
                        </div>
                    </form>
                </section>
            )}

            <section>
                <div className="mb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        Your activities
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Activities created by your
                        organiser account.
                    </p>
                </div>

                {activities.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                        <CalendarDays
                            size={34}
                            className="mx-auto text-slate-400"
                        />

                        <h3 className="mt-4 text-lg font-semibold text-slate-900">
                            No activities yet
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                            Create your first activity
                            to start attracting
                            students.
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setShowCreateForm(
                                    true,
                                )
                            }
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
                        >
                            <Plus size={17} />

                            Create activity
                        </button>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="divide-y divide-slate-100">
                            {activities.map(
                                (activity) => (
                                    <ActivityRow
                                        key={
                                            activity.id
                                        }
                                        activity={
                                            activity
                                        }
                                        onCancel={
                                            handleCancel
                                        }
                                        onDelete={
                                            handleDelete
                                        }
                                    />
                                ),
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}

type StatCardProps = {
    icon: React.ElementType
    label: string
    value: number
}

const StatCard = ({
                      icon: Icon,
                      label,
                      value,
                  }: StatCardProps) => {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon size={20} />
                </div>

                <span className="text-2xl font-bold text-slate-900">
                    {value}
                </span>
            </div>

            <p className="mt-4 text-sm font-medium text-slate-500">
                {label}
            </p>
        </div>
    )
}

type FormFieldProps = {
    label: string
    name: string
    value: string
    onChange: (
        event: React.ChangeEvent<HTMLInputElement>,
    ) => void
    placeholder?: string
    type?: string
    min?: string
    step?: string
    required?: boolean
}

const FormField = ({
                       label,
                       name,
                       value,
                       onChange,
                       placeholder,
                       type = "text",
                       min,
                       step,
                       required,
                   }: FormFieldProps) => {
    return (
        <div>
            <label className="text-sm font-semibold text-slate-900">
                {label}
            </label>

            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                min={min}
                step={step}
                required={required}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
        </div>
    )
}

type SelectFieldProps = {
    label: string
    name: string
    value: string
    onChange: (
        event: React.ChangeEvent<HTMLSelectElement>,
    ) => void
    options: Array<{
        id: string
        name: string
    }>
    placeholder: string
}

const SelectField = ({
                         label,
                         name,
                         value,
                         onChange,
                         options,
                         placeholder,
                     }: SelectFieldProps) => {
    return (
        <div>
            <label className="text-sm font-semibold text-slate-900">
                {label}
            </label>

            <select
                name={name}
                value={value}
                onChange={onChange}
                required
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            >
                <option value="">
                    {placeholder}
                </option>

                {options.map((option) => (
                    <option
                        key={option.id}
                        value={option.id}
                    >
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
    )
}

type ActivityRowProps = {
    activity: OrganiserActivity
    onCancel: (
        activityId: string,
    ) => Promise<void>
    onDelete: (
        activityId: string,
    ) => Promise<void>
}

const ActivityRow = ({
                         activity,
                         onCancel,
                         onDelete,
                     }: ActivityRowProps) => {
    const start = new Date(
        activity.start_time,
    )

    const isPast = start < new Date()

    return (
        <div className="p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                            {activity.category_name}
                        </span>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                activity.status ===
                                "published"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : activity.status ===
                                    "cancelled"
                                        ? "bg-red-50 text-red-700"
                                        : "bg-slate-100 text-slate-600"
                            }`}
                        >
                            {activity.status}
                        </span>
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-slate-900">
                        {activity.title}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                        <span>
                            {start.toLocaleDateString(
                                "en-GB",
                                {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                },
                            )}
                        </span>

                        <span>
                            {start.toLocaleTimeString(
                                "en-GB",
                                {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                },
                            )}
                        </span>

                        <span>
                            {activity.venue_name ??
                                "Venue TBC"}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                            <Ticket size={16} />

                            {activity.booking_count ??
                                0}
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                            bookings
                        </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                        <div className="text-sm font-semibold text-slate-900">
                            {activity.capacity}
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                            capacity
                        </p>
                    </div>

                    {activity.status ===
                        "published" &&
                        !isPast && (
                            <button
                                type="button"
                                onClick={() =>
                                    onCancel(
                                        activity.id,
                                    )
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                            >
                                <XCircle
                                    size={16}
                                />

                                Cancel
                            </button>
                        )}

                    <button
                        type="button"
                        onClick={() =>
                            onDelete(
                                activity.id,
                            )
                        }
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                        <Trash2 size={16} />

                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

export default OrganiserDashboard