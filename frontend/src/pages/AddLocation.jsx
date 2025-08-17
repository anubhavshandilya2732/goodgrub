import { useState } from "react";
import API from "../api";
import Navbar from '../components/Navbar'

export default function AddLocation() {
  const [form, setForm] = useState({ address: "", city: "", district: "", state: "", country: "" });
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/add_location", { locations: [form] });
      setMsg("Location added successfully!");
    } catch (err) {
      setMsg(err.response?.data?.detail || "Error");
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Add Location</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input className="border px-3 py-2 rounded" placeholder="Address" onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="City" onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="District" onChange={(e) => setForm({ ...form, district: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="State" onChange={(e) => setForm({ ...form, state: e.target.value })} />
          <input className="border px-3 py-2 rounded" placeholder="Country" onChange={(e) => setForm({ ...form, country: e.target.value })} />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Save Location</button>
        </form>
        <p className="mt-2 text-green-700">{msg}</p>
      </div>
    </div>
  );
}
