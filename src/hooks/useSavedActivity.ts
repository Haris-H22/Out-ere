import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { useAuth } from "../context/AuthContext"
import { supabase } from "../lib/supabase"

type UseSavedActivityResult = {
    isSaved: boolean
    isLoading: boolean
    isSaving: boolean
    toggleSaved: () => Promise<void>
    error: Error | null
}

export const useSavedActivity = (
    activityId: string,
): UseSavedActivityResult => {
    const { user } = useAuth()
    const queryClient = useQueryClient()

    const {
        data: savedActivity,
        isLoading,
        error: queryError,
    } = useQuery({
        queryKey: ["saved-activity", user?.id, activityId],

        queryFn: async () => {
            if (!user || !activityId) {
                return null
            }

            const { data, error } = await supabase
                .from("saved_activities")
                .select("activity_id")
                .eq("user_id", user.id)
                .eq("activity_id", activityId)
                .maybeSingle()

            if (error) {
                throw new Error(error.message)
            }

            return data
        },

        enabled: Boolean(user && activityId),
    })

    const mutation = useMutation({
        mutationFn: async () => {
            if (!user) {
                throw new Error(
                    "You must be signed in to save an activity.",
                )
            }

            if (!activityId) {
                throw new Error("Activity ID is missing.")
            }

            // Check whether this activity is already saved.
            const { data: existingSave, error: checkError } =
                await supabase
                    .from("saved_activities")
                    .select("activity_id")
                    .eq("user_id", user.id)
                    .eq("activity_id", activityId)
                    .maybeSingle()

            if (checkError) {
                throw new Error(checkError.message)
            }

            // Already saved → remove it.
            if (existingSave) {
                const { error: deleteError } = await supabase
                    .from("saved_activities")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("activity_id", activityId)

                if (deleteError) {
                    throw new Error(deleteError.message)
                }

                return {
                    saved: false,
                }
            }

            // Not saved → add it.
            const { error: insertError } = await supabase
                .from("saved_activities")
                .insert({
                    user_id: user.id,
                    activity_id: activityId,
                })

            if (insertError) {
                throw new Error(insertError.message)
            }

            return {
                saved: true,
            }
        },

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: [
                    "saved-activity",
                    user?.id,
                    activityId,
                ],
            })

            await queryClient.invalidateQueries({
                queryKey: [
                    "saved-activities",
                    user?.id,
                ],
            })
        },
    })

    return {
        isSaved: Boolean(savedActivity),
        isLoading,
        isSaving: mutation.isPending,

        toggleSaved: async () => {
            await mutation.mutateAsync()
        },

        error:
            (mutation.error as Error | null) ??
            (queryError as Error | null) ??
            null,
    }
}