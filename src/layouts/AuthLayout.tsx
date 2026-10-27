import { Link, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="auth-shell min-vh-100 d-flex">
      <div className="auth-art d-none d-lg-flex flex-column justify-content-between p-5 text-white">
        <Link to="/"><img src="/images/logo-light.svg" alt="Southern Rose" height={48} /></Link>
        <div><h2 className="display-5 fw-bold">Pursuing wellbeing.</h2><p className="lead text-white-50">Real Ingredients. Real Benefits. Track orders, save addresses and reorder in seconds.</p>
          <img src="/images/hero/slide-1.svg" alt="" className="w-75" /></div>
        <small className="text-white-50">© {new Date().getFullYear()} Southern Rose</small>
      </div>
      <div className="flex-grow-1 d-flex align-items-center justify-content-center p-3 p-md-5 bg-body">
        <div className="w-100" style={{ maxWidth: 440 }}>
          <Link to="/" className="d-lg-none d-block mb-4 text-center"><img src="/images/logo.svg" alt="Southern Rose" height={44} /></Link>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
