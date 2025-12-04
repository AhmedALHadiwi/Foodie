// eslint-disable-next-line no-unused-vars
import { Navigate } from "react-router-dom";
import { hasToken } from "../../utils/authUtils";

export function GuestRoute({ children }) {
  return hasToken() ? <Navigate to="/restaurants" replace /> : children;
}
