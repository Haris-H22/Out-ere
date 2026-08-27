import { supabase } from "../lib/supabase"

export const isActivitySaved = async (
    userId: string,
    activityId: string,
): Promise<boolean> => {
    const { data, error } = await supabase
        .from("saved_activities")
        .select("id")
        .eq("user_id", userId)
        .eq("activity_id", activityId)
        .maybeSingle()

    if (error) {
        throw new Error(error.message)
    }

    return Boolean(data)
}

export const saveActivity = async (
    userId: string,
    activityId: string,
): Promise<void> => {
    const { error } = await supabase
        .from("saved_activities")
        .insert({
            user_id: userId,
            activity_id: activityId,
        })

    if (error) {
        throw new Error(error.message)
    }
}

export const unsaveActivity = async (
    userId: string,
    activityId: string,
): Promise<void> => {
    const { error } = await supabase
        .from("saved_activities")
        .delete()
        .eq("user_id", userId)
        .eq("activity_id", activityId)

    if (error) {
        throw new Error(error.message)
    }
}

export const toggleSavedActivity = async (
    userId: string,
    activityId: string,
    currentlySaved: boolean,
): Promise<boolean> => {
    if (currentlySaved) {
        await unsaveActivity(userId, activityId)

        return false
    }

    await saveActivity(userId, activityId)

    return true
}