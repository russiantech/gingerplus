import { Link } from "react-router-dom";
import { useDocumentTitle } from "@/hooks";

export default function NotFoundPage() {
  useDocumentTitle("Page not found");
  return (
    <div className="container text-center py-5 min-vh-60 d-flex flex-column justify-content-center align-items-center">
      <img src="/images/products/turmeric.webp" alt="" height={180} className="mb-3 opacity-75" />
      <h1 className="display-4 fw-bold">404</h1><p className="lead text-muted">We couldn't find that page — but the ginger is still fresh.</p>
      <div className="d-flex gap-2"><Link to="/" className="btn btn-primary btn-pill px-4">Back home</Link><Link to="/shop" className="btn btn-outline-primary btn-pill px-4">Shop</Link></div>
    </div>
  );
}
