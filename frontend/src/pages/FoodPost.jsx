import { useState } from "react";
import API from "../api";
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

export default function FoodPost() {
  const [form, setForm] = useState({
    name: "",
    type: "veg",
    quantity: 0,
    freshness: "",
    address: "",
    city: "",
    district: "",
    state: "",
    country: "",
    datetime: "",
  });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/food_post", {
        name: form.name,
        type: form.type,
        quantity: parseInt(form.quantity),
        freshness: form.freshness,
        datetime: form.datetime,
        location: [
          {
            address: form.address,
            city: form.city,
            district: form.district,
            state: form.state,
            country: form.country,
          },
        ],
      });
      setMsg("Food post created successfully!");
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate('/active-donation', { state: { city: form.city } });
      }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.detail || "Error");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Create Food Post</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input className="border px-3 py-2 rounded" placeholder="Food Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <select className="border px-3 py-2 rounded" onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="veg">Veg</option>
            <option value="non-veg">Non-Veg</option>
          </select>
          <input className="border px-3 py-2 rounded" placeholder="Quantity" type="number" onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Freshness (e.g. 3h)" onChange={(e) => setForm({ ...form, freshness: e.target.value })} />
          <input className="border px-3 py-2 rounded" type="datetime-local" onChange={(e) => setForm({ ...form, datetime: e.target.value })} />
          <h4 className="font-semibold mt-2">Location</h4>
          <input className="border px-3 py-2 rounded" placeholder="Address" onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="City" onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="District" onChange={(e) => setForm({ ...form, district: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="State" onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Country" onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create Post</button>
        </form>
        <p className="mt-2 text-green-700">{msg}</p>
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-xs text-center">
            <h3 className="text-lg font-bold mb-2 text-green-700">Success!</h3>
            <p>Food post created successfully!</p>
          </div>
        </div>
      )}
    </div>
  );
}
