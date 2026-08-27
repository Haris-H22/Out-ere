import { useQuery } from "@tanstack/react-query"

import { getPublishedActivities } from "../services/activityService"

export const useActivities = () => {
    return useQuery({
        queryKey: ["activities", "published"],
        queryFn: getPublishedActivities,
    })
}