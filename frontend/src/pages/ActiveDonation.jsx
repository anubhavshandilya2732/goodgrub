import { useState, useEffect, useRef } from "react";
import Navbar from '../components/Navbar';
import API from "../api";

export default function ActiveDonation() {
  const [foodList, setFoodList] = useState([]);
  const [msg, setMsg] = useState("");
  const [city, setCity] = useState("Delhi");
  const [showClaim, setShowClaim] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [claimMsg, setClaimMsg] = useState("");
  const [quantity, setQuantity] = useState("");

  const wsRef = useRef(null);

  useEffect(() => {
    fetchFoodList();
    // eslint-disable-next-line
  }, [city]);

  useEffect(() => {
    // WebSocket connection
    const ws = new window.WebSocket("ws://192.168.29.58:8000/ws/active-donation");
    wsRef.current = ws;
    let pingInterval = setInterval(() => {
      if (ws.readyState === 1) ws.send("ping");
    }, 30000);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.id) {
          setFoodList(prev => prev.map(post =>
            post.id === data.id ? { ...post, quantity: data.quantity, post_status: data.post_status } : post
          ));
        }
      } catch (e) {}
    };
    ws.onclose = () => { wsRef.current = null; clearInterval(pingInterval); };
    return () => { ws.close(); clearInterval(pingInterval); };
  }, []);

  const fetchFoodList = async () => {
    try {
      const res = await API.get(`/food_posts/${city}`);
      setFoodList(res.data);
      setMsg("");
    } catch (err) {
      setFoodList([]);
      setMsg(err.response?.data?.detail || "No food posts found.");
    }
  };

  const handleClaimClick = (post) => {
    setSelectedPost(post);
    setShowClaim(true);
    setClaimMsg("");
    setQuantity(""); // Reset quantity input
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!quantity) {
      setClaimMsg("Please enter quantity to claim.");
      return;
    }
    try {
      const res = await API.post(`/claim_food/${selectedPost.id}`, {
        quantity: parseInt(quantity),
      });
      setClaimMsg(`Claimed! Remaining: ${res.data.remaining}`);

      // Update the quantity in foodList
      setFoodList(foodList.map(post =>
        post.id === selectedPost.id
          ? { ...post, quantity: res.data.remaining }
          : post
      ));

      setTimeout(() => {
        setShowClaim(false);
        setClaimMsg("");
      }, 1500);
    } catch (err) {
      setClaimMsg(err.response?.data?.detail || "Error claiming food.");
    }
  };

  // Sort posts by id descending (latest first)
  const sortedFoodList = [...foodList].sort((a, b) => (b.id || 0) - (a.id || 0));

  return (
    <div>
      <Navbar />
      <h2 className="mt-4 text-xl font-bold">Active Donations</h2>
      <div className="my-4">
        <label>Location: </label>
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="Enter city"
          className="border px-2 py-1"
        />
        <button onClick={fetchFoodList} className="ml-2 px-3 py-1 bg-blue-600 text-white rounded">Search</button>
      </div>
      {msg && <p>{msg}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedFoodList.map(post => (
          <div key={post.id} className="bg-white shadow rounded p-4 border relative">
            <h3 className="text-lg font-bold mb-2">{post.name}</h3>
            <p><strong>Type:</strong> {post.type}</p>
            <p><strong>Quantity:</strong> {post.quantity}</p>
            <p><strong>Freshness:</strong> {post.freshness}</p>
            <p><strong>Status:</strong> {post.post_status}</p>
            <div className="mt-2">
              <strong>Location:</strong>
              {post.location && post.location.length > 0 ? (
                <ul className="list-disc ml-5">
                  {post.location.map((loc, idx) => (
                    <li key={idx}>
                      {loc.address}, {loc.city}, {loc.district}, {loc.state}, {loc.country}
                    </li>
                  ))}
                </ul>
              ) : (
                <span> Not specified</span>
              )}
            </div>
            <button
              className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              onClick={() => handleClaimClick(post)}
            >
              Claim
            </button>
          </div>
        ))}
      </div>

      {/* Claim Popup */}
      {showClaim && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h3 className="text-lg font-bold mb-2">Claim Food: {selectedPost.name}</h3>
            <p>Enter the quantity you want to claim:</p>
            <form onSubmit={handleClaim} className="mt-4 flex flex-col gap-2">
              <input
                type="number"
                min="1"
                max={selectedPost.quantity}
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className="border px-3 py-2 rounded"
                placeholder={`Max: ${selectedPost.quantity}`}
              />
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Confirm Claim
              </button>
              <button
                type="button"
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                onClick={() => setShowClaim(false)}
              >
                Cancel
              </button>
            </form>
            {claimMsg && <p className="mt-2 text-green-700">{claimMsg}</p>}
          </div>
        </div>
      )}
    </div>
  );
}