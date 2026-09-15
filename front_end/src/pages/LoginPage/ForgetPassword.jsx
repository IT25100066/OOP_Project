import { useState } from "react";
import axiosInstance from '../../api/axiosInstance';

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email) {
      setMessage("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        "/auth/forgot-password",
        {
          email: email,
        }
      );

      setMessage(response.data.message || response.data);
      setTimeout(() => {
              navigate("/PasswordReset");
            }, 2000);

    } catch (error) {
      if (error.response?.data?.error) {
        setMessage(error.response.data.error);
      } else if (typeof error.response?.data === 'string') {
        setMessage(error.response.data);
      } else {
        setMessage("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Forgot Password</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

export default ForgotPassword;

/* UI Styles */
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    background: "#24095bff",
  },
  card: {
    width: "350px",
    padding: "20px",
    background: "#0a083f96",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    border: "1px solid #000000ff",
    borderRadius: "5px",
  },
  button: {
    padding: "10px",
    background: "#28a745",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  message: {
    marginTop: "10px",
    color: "green",
  },
};