import { supabase } from "../lib/supabase"
import type { Activity } from "../types/activity"

export const getPublishedActivities = async (): Promise<Activity[]> => {
    const { data, error } = await supabase
        .from("activities")
        .select(`
      id,
      title,
      description,
      image_url,
      category_id,
      university_id,
      organiser_id,
      venue_name,
      address,
      city,
      start_time,
      end_time,
      price,
      capacity,
      status,
      created_at,
      updated_at,
      category:categories (
        id,
        name,
        description,
        icon
      ),
      university:universities (
        id,
        name,
        city,
        country
      )
    `)
        .eq("status", "published")
        .order("start_time", {
            ascending: true,
        })

    if (error) {
        throw new Error(
            `Failed to load activities: ${error.message}`,
        )
    }

    return (data ?? []) as unknown as Activity[]
}

export const getActivityById = async (
    activityId: string,
): Promise<Activity> => {
    const { data, error } = await supabase
        .from("activities")
        .select(`
      id,
      title,
      description,
      image_url,
      category_id,
      university_id,
      organiser_id,
      venue_name,
      address,
      city,
      start_time,
      end_time,
      price,
      capacity,
      status,
      created_at,
      updated_at,
      category:categories (
        id,
        name,
        description,
        icon
      ),
      university:universities (
        id,
        name,
        city,
        country
      )
    `)
        .eq("id", activityId)
        .eq("status", "published")
        .single()

    if (error) {
        throw new Error(
            `Failed to load activity: ${error.message}`,
        )
    }

    return data as unknown as Activity
}
