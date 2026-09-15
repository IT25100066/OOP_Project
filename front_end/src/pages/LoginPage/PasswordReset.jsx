import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axiosInstance from '../../api/axiosInstance';


function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    // basic validation
    if (!password || !confirmPassword) {
      setMessage("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (!token) {
      setMessage("Invalid or missing token");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        "/auth/reset-password",
        {
          token: token,
          newPassword: password,
        }
      );

      setMessage(response.data);

      // redirect after success
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      if (error.response) {
        setMessage(error.response.data);
      } else {
        setMessage("Server error. Try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Reset Password</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
          />

          <button
            type="submit"
            disabled={loading}
            style={styles.button}
          >
            {loading ? "Updating..." : "Reset Password"}
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}
      </div>
    </div>
  );
}

export default ResetPassword;

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#24095bff',
  },
  card: {
    background: '#0a083f96',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 75, 160, 0.1)',
    width: '100%',
    maxWidth: '400px',
  },
  button: {
    backgroundColor: '#1edd17ff',
    color: '#fff',
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '2px solid #e1e8f0',
    marginBottom: '1rem',
  }
};

