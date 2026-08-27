import { Route, Routes } from "react-router-dom"

import AppLayout from "../layouts/AppLayout"

import Home from "../pages/Home"
import Discover from "../pages/Discover"
import ActivityDetails from "../pages/ActivityDetails"
import Saved from "../pages/Saved"
import Bookings from "../pages/Bookings"
import OrganiserDashboard from "../pages/OrganiserDashboard"
import Profile from "../pages/Profile"
import Login from "../pages/Login"
import Register from "../pages/Register"

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />

                <Route
                    path="/discover"
                    element={<Discover />}
                />

                <Route
                    path="/discover/:activityId"
                    element={<ActivityDetails />}
                />

                <Route
                    path="/saved"
                    element={<Saved />}
                />

                <Route
                    path="/bookings"
                    element={<Bookings />}
                />
                <Route
                    path="/organiser"
                    element={<OrganiserDashboard />}
                />

                <Route
                    path="/profile"
                    element={<Profile />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />
            </Route>
        </Routes>
    )
}

export default AppRoutes