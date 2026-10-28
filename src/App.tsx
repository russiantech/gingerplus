import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SiteProvider } from "@/contexts/SiteContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { PaymentProvider } from "@/components/payments/PaymentProvider";
import OfflineBanner from "@/components/common/OfflineBanner";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import AppRoutes from "@/routes";

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider><SiteProvider><AuthProvider><CartProvider><PaymentProvider><ErrorBoundary><AppRoutes /></ErrorBoundary><OfflineBanner /></PaymentProvider></CartProvider></AuthProvider></SiteProvider></ToastProvider>
    </BrowserRouter>
  );
}
