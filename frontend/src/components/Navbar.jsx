import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  const handleUserClick = () => setShowMenu(v => !v)
  const handleProfile = () => {
    setShowMenu(false)
    navigate('/profile')
  }
  const handleAddLocation = () => {
    setShowMenu(false)
    navigate('/add-location')
  }
  const handleLogout = () => {
    localStorage.removeItem('token')
    setShowMenu(false)
    navigate('/')
  }

  return (
    <nav className="bg-gray-800 text-white p-4 flex gap-4 items-center">
      <Link to="/home" className="hover:underline">Events</Link>
      <Link to="/active-donation" className="hover:underline">Active Donation</Link>
      <Link to="/dashboard" className="hover:underline">Dashboard</Link>
      <Link to="/food-post" className="hover:underline">Donate Food</Link>
      <Link to="/about" className="hover:underline">About</Link>
      <div className="ml-auto relative">
        <button onClick={handleUserClick} className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700">User</button>
        {showMenu && (
          <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded shadow z-50">
            <button onClick={handleProfile} className="block w-full text-left px-4 py-2 hover:bg-gray-100">Profile</button>
            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">Logout</button>
          </div>
        )}
      </div>
    </nav>
  )
}