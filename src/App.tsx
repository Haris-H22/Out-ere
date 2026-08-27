import {
    Route,
    Routes,
} from "react-router-dom"

import AppLayout from "./layouts/AppLayout"

import Home from "./pages/Home"
import Discover from "./pages/Discover"
import Saved from "./pages/Saved"
import Bookings from "./pages/Bookings"
import Profile from "./pages/Profile"
import ActivityDetails from "./pages/ActivityDetails"
import Login from "./pages/Login"
import Register from "./pages/Register"
import OrganiserDashboard from "./pages/OrganiserDashboard"

import ProtectedRoute from "./routes/ProtectedRoute"
import OrganiserRoute from "./routes/OrganiserRoute"

const App = () => {
    return (
        <Routes>
            <Route
                element={<AppLayout />}
            >
                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/discover"
                    element={<Discover />}
                />

                <Route
                    path="/discover/:activityId"
                    element={
                        <ActivityDetails />
                    }
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    element={
                        <ProtectedRoute />
                    }
                >
                    <Route
                        path="/saved"
                        element={<Saved />}
                    />

                    <Route
                        path="/bookings"
                        element={
                            <Bookings />
                        }
                    />

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                    <Route
                        element={
                            <OrganiserRoute />
                        }
                    >
                        <Route
                            path="/organiser"
                            element={
                                <OrganiserDashboard />
                            }
                        />
                    </Route>
                </Route>
            </Route>
        </Routes>
    )
}

export default App