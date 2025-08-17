import { useState } from "react";
import API from "../api";

export default function ClaimFood() {
  const [postId, setPostId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [msg, setMsg] = useState("");

  const handleClaim = async (e) => {
    e.preventDefault();

    if (!postId || !quantity) {
      setMsg("Please enter both Post ID and Quantity");
      return;
    }

    try {
      const res = await API.post(`/claim_food/${postId}`, {
        quantity: parseInt(quantity),
      });
      setMsg(`✅ Claimed! Remaining: ${res.data.remaining}`);
    } catch (err) {
      setMsg(err.response?.data?.detail || "❌ Error claiming food");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">🍴 Claim Food</h2>
      <form onSubmit={handleClaim} className="flex flex-col gap-3">
        <input
          className="border px-3 py-2 rounded"
          placeholder="Post ID"
          value={postId}
          onChange={(e) => setPostId(e.target.value)}
        />
        <input
          className="border px-3 py-2 rounded"
          placeholder="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Claim
        </button>
      </form>
      {msg && <p className="mt-3">{msg}</p>}
    </div>
  );
}