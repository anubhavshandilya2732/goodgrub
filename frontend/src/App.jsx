import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOtp from './pages/VerifyOtp'
import Home from './pages/Home'
import ActiveDonation from './pages/ActiveDonation'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import ProtectedRoute from './components/ProtectedRoute'
import AddLocation from './pages/AddLocation'
import FoodPost from './pages/FoodPost'
import Profile from './pages/Profile'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
        <Route path="/active-donation" element={
          <ProtectedRoute>
            <ActiveDonation />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/about" element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        } />
        <Route path="/add-location" element={
          <ProtectedRoute>
            <AddLocation />
          </ProtectedRoute>
        } />
        <Route path="/food-post" element={
          <ProtectedRoute>
            <FoodPost />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

export default App