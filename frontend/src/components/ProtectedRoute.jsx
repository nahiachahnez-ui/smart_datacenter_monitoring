import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, roleRequired }) {

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in
  if (!token) {
    return <Navigate to="/" />;
  }

  // Role protection
  if (roleRequired && role !== roleRequired) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default ProtectedRoute;