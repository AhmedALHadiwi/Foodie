// eslint-disable-next-line no-unused-vars
import { Navigate } from "react-router-dom";
import { hasToken } from "../../utils/authUtils";

export function ProtectedRoute({ children }) {
  return hasToken() ? children : <Navigate to="/" replace />;
}
