import { useState, useEffect } from "react";
import API from "../api";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [msg, setMsg] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await API.get("/user/profile");
      setUser(res.data);
    } catch (err) {
      setMsg(err.response?.data?.detail || "Error");
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Profile</h2>
      {user ? (
        <div className="space-y-4">
          <div><span className="font-semibold">Username:</span> {user.username}</div>
          <div><span className="font-semibold">Email:</span> {user.email}</div>
          <div><span className="font-semibold">Donations:</span> {user.donation_count}</div>
          <div><span className="font-semibold">Total Quantity Donated:</span> {user.total_quantity}</div>
          <div>
            <span className="font-semibold">Your Food Posts:</span>
            <ul className="list-disc ml-6 mt-2">
              {user.food_posts && user.food_posts.length > 0 ? user.food_posts.map(fp => (
                <li key={fp.id} className="text-sm">{fp.name} (Quantity: {fp.quantity})</li>
              )) : <li className="text-sm">No posts yet.</li>}
            </ul>
          </div>
        </div>
      ) : (
        <p>{msg || "Loading..."}</p>
      )}
    </div>
  );
}