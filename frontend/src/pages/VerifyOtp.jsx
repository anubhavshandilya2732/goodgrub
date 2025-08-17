import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api";

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      await API.post("/verify-otp", { email, otp });
      setMsg("Email verified! You can now login.");
      setTimeout(() => navigate("/"), 1500); // Redirect to login after verification
    } catch (err) {
      setMsg(err.response?.data?.detail || "Error");
    }
  };

  return (
    <div>
      <h2>Verify Email</h2>
      <form onSubmit={handleVerify}>
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          placeholder="OTP"
          value={otp}
          onChange={e => setOtp(e.target.value)}
        />
        <button type="submit">Verify</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}