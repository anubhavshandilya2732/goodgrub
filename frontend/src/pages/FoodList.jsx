import { useState } from "react";
import API from "../api";
import Navbar from '../components/Navbar'
import { useLocation } from 'react-router-dom'

export default function FoodList() {
  const location = useLocation();
  const [city, setCity] = useState(location.state?.city || "");
  const [posts, setPosts] = useState([]);
  const [msg, setMsg] = useState("");

  const fetchPosts = async () => {
    if (!city) {
      setMsg("Please enter a city");
      setPosts([]);
      return;
    }

    try {
      const res = await API.get(`/food_posts/${city}`);
      console.log("API response:", res.data);
      setPosts(res.data);
      setMsg("");
    } catch (err) {
      setPosts([]);
      setMsg(err.response?.data?.detail || "Error fetching posts");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Navbar />
      <h2 className="text-2xl font-bold mb-4">🍽️ Food Posts</h2>

      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          onClick={fetchPosts}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Fetch
        </button>
      </div>

      {msg && <p className="text-red-500 mb-3">{msg}</p>}
      {posts.length === 0 && !msg && <p>No posts found</p>}

      <div className="grid gap-4">
        {posts.map((post) => {
          const location = Array.isArray(post.location)
            ? post.location[0]
            : post.location;

          return (
            <div
              key={post.id}
              className="p-5 border rounded-lg shadow-sm bg-white"
            >
              <h3 className="text-xl font-semibold mb-2">{post.name}</h3>
              <p><span className="font-medium">Type:</span> {post.type}</p>
              <p><span className="font-medium">Quantity:</span> {post.quantity}</p>
              <p><span className="font-medium">Freshness:</span> {post.freshness}</p>
              <p><span className="font-medium">Status:</span> {post.post_status}</p>
              <p><span className="font-medium">Post_id:</span> {post.id}</p>

              {location && (
                <div className="mt-3 text-sm text-gray-700">
                  <p className="font-medium">📍 Address Details:</p>
                  <p>{location.address}</p>
                  <p>
                    {location.city}, {location.district}, {location.state},{" "}
                    {location.country}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
