import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SiteProvider } from "@/contexts/SiteContext";
import { ToastProvider } from "@/contexts/ToastContext";
import AppRoutes from "@/routes";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider><SiteProvider><AuthProvider><CartProvider><AppRoutes /></CartProvider></AuthProvider></SiteProvider></ToastProvider>
    </BrowserRouter>
  );
}
