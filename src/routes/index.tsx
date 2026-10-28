import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { PageLoader } from "@/components/common";
import AccountLayout from "@/layouts/AccountLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";
import PublicLayout from "@/layouts/PublicLayout";
import { GuestOnly, RequireAuth, RequirePartner, RequireStaff } from "./guards";

const p = (f: () => Promise<{ default: React.ComponentType }>) => lazy(f);
// ---- public ----
const Home = p(() => import("@/pages/public/HomePage"));
const Shop = p(() => import("@/pages/public/ShopPage"));
const ProductDetail = p(() => import("@/pages/public/ProductDetailPage"));
const CmsPage = p(() => import("@/pages/public/CmsPage"));
const Recipes = p(() => import("@/pages/public/RecipesPage"));
const RecipeDetail = p(() => import("@/pages/public/RecipeDetailPage"));
const Blog = p(() => import("@/pages/public/BlogPage"));
const BlogPost = p(() => import("@/pages/public/BlogPostPage"));
const Testimonials = p(() => import("@/pages/public/TestimonialsPage"));
const Faq = p(() => import("@/pages/public/FaqPage"));
const Contact = p(() => import("@/pages/public/ContactPage"));
const Newsletter = p(() => import("@/pages/public/NewsletterPage"));
const StoreLocator = p(() => import("@/pages/public/StoreLocatorPage"));
const NotFound = p(() => import("@/pages/public/NotFoundPage"));
// ---- commerce ----
const Cart = p(() => import("@/pages/public/CartPage"));
const Checkout = p(() => import("@/pages/public/CheckoutPage"));
const OrderConfirmation = p(() => import("@/pages/public/OrderConfirmationPage"));
const PaymentCallback = p(() => import("@/pages/public/PaymentCallbackPage"));
const TrackOrder = p(() => import("@/pages/public/TrackOrderPage"));
const DirectPayment = p(() => import("@/pages/public/DirectPaymentPage"));
// ---- auth & account ----
const Login = p(() => import("@/pages/auth/LoginPage"));
const Register = p(() => import("@/pages/auth/RegisterPage"));
const Forgot = p(() => import("@/pages/auth/ForgotPasswordPage"));
const AccountHome = p(() => import("@/pages/account/AccountHomePage"));
const AccountOrders = p(() => import("@/pages/account/OrdersPage"));
const AccountOrder = p(() => import("@/pages/account/OrderDetailPage"));
const AccountAddresses = p(() => import("@/pages/account/AddressesPage"));
const AccountProfile = p(() => import("@/pages/account/ProfilePage"));
const Partner = p(() => import("@/pages/account/PartnerPortalPage"));
// ---- admin ----
const A = (n: string) => lazy(() => import(`../pages/admin/${n}.tsx`));
const adminPages = {
  Dashboard: A("DashboardPage"), Analytics: A("AnalyticsPage"), Orders: A("OrdersPage"), OrderDetail: A("OrderDetailPage"), OrderNew: A("OrderCreatePage"),
  Payments: A("PaymentsPage"), Customers: A("CustomersPage"), CustomerDetail: A("CustomerDetailPage"), Shipping: A("ShippingPage"),
  Products: A("ProductsPage"), ProductEdit: A("ProductEditPage"), Categories: A("CategoriesPage"), Promotions: A("PromotionsPage"),
  Stores: A("StoresPage"), Applications: A("ApplicationsPage"), Inbox: A("InboxPage"), Contacts: A("ContactsPage"), Subscribers: A("SubscribersPage"),
  Hero: A("HeroSlidesPage"), Pages: A("PagesPage"), PageEdit: A("PageEditPage"), Blog: A("BlogAdminPage"), Recipes: A("RecipesAdminPage"),
  Testimonials: A("TestimonialsAdminPage"), Faqs: A("FaqsAdminPage"), Users: A("UsersPage"), Roles: A("RolesPage"), Settings: A("SettingsPage"), PaymentSettings: A("PaymentSettingsPage"),
};

export default function AppRoutes() {
  const X = adminPages;
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="products/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation" element={<OrderConfirmation />} />
          <Route path="payment/callback" element={<PaymentCallback />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="pay" element={<DirectPayment />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="recipes/:slug" element={<RecipeDetail />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:slug" element={<BlogPost />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="faq" element={<Faq />} />
          <Route path="contact" element={<Contact />} />
          <Route path="newsletter" element={<Newsletter />} />
          <Route path="find-a-store" element={<StoreLocator />} />
          <Route element={<RequirePartner />}><Route path="partner" element={<Partner />} /></Route>
          <Route path=":slug" element={<CmsPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<GuestOnly />}><Route element={<AuthLayout />}>
          <Route path="login" element={<Login />} /><Route path="register" element={<Register />} /><Route path="forgot-password" element={<Forgot />} />
        </Route></Route>

        <Route element={<RequireAuth />}><Route element={<PublicLayout />}><Route element={<AccountLayout />}>
          <Route path="account" element={<AccountHome />} /><Route path="account/orders" element={<AccountOrders />} />
          <Route path="account/orders/:id" element={<AccountOrder />} /><Route path="account/addresses" element={<AccountAddresses />} />
          <Route path="account/profile" element={<AccountProfile />} />
        </Route></Route></Route>

        <Route path="admin" element={<RequireStaff />}><Route element={<AdminLayout />}>
          <Route element={<RequireStaff perm="dashboard:view" />}><Route index element={<X.Dashboard />} /><Route path="dashboard" element={<Navigate to="/admin" replace />} /></Route>
          <Route element={<RequireStaff perm="analytics:view" />}><Route path="analytics" element={<X.Analytics />} /></Route>
          <Route element={<RequireStaff perm="orders:view" />}><Route path="orders" element={<X.Orders />} /><Route path="orders/:id" element={<X.OrderDetail />} /></Route>
          <Route element={<RequireStaff perm="orders:manage" />}><Route path="orders/new" element={<X.OrderNew />} /><Route path="shipping" element={<X.Shipping />} /></Route>
          <Route element={<RequireStaff perm="payments:view" />}><Route path="payments" element={<X.Payments />} /></Route>
          <Route element={<RequireStaff perm="customers:view" />}><Route path="customers" element={<X.Customers />} /><Route path="customers/:id" element={<X.CustomerDetail />} /></Route>
          <Route element={<RequireStaff perm="products:view" />}>
            <Route path="products" element={<X.Products />} /><Route path="products/new" element={<X.ProductEdit />} /><Route path="products/:id" element={<X.ProductEdit />} /><Route path="categories" element={<X.Categories />} /></Route>
          <Route element={<RequireStaff perm="promotions:manage" />}><Route path="promotions" element={<X.Promotions />} /></Route>
          <Route element={<RequireStaff perm="stores:view" />}><Route path="stores" element={<X.Stores />} /><Route path="applications" element={<X.Applications />} /></Route>
          <Route element={<RequireStaff perm="emails:manage" />}><Route path="inbox" element={<X.Inbox />} /></Route>
          <Route element={<RequireStaff perm="contacts:manage" />}><Route path="contacts" element={<X.Contacts />} /><Route path="subscribers" element={<X.Subscribers />} /></Route>
          <Route element={<RequireStaff perm="content:manage" />}>
            <Route path="content/hero" element={<X.Hero />} /><Route path="content/pages" element={<X.Pages />} /><Route path="content/pages/:id" element={<X.PageEdit />} />
            <Route path="content/blog" element={<X.Blog />} /><Route path="content/recipes" element={<X.Recipes />} /><Route path="content/testimonials" element={<X.Testimonials />} /><Route path="content/faqs" element={<X.Faqs />} /></Route>
          <Route element={<RequireStaff perm="users:manage" />}><Route path="users" element={<X.Users />} /><Route path="roles" element={<X.Roles />} /></Route>
          <Route element={<RequireStaff perm="settings:manage" />}><Route path="settings" element={<X.Settings />} /><Route path="payment-settings" element={<X.PaymentSettings />} /></Route>
        </Route></Route>
      </Routes>
    </Suspense>
  );
}
