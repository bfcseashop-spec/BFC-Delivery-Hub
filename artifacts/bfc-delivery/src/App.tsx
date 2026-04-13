import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/CartContext";
import { AuthProvider } from "@/lib/AuthContext";

import Home from "@/pages/Home";
import Restaurants from "@/pages/Restaurants";
import RestaurantDetail from "@/pages/RestaurantDetail";
import Checkout from "@/pages/Checkout";
import Order from "@/pages/Order";
import Orders from "@/pages/Orders";
import MyOrders from "@/pages/MyOrders";
import NotFound from "@/pages/not-found";

import Login from "@/pages/auth/Login";
import Signup from "@/pages/auth/Signup";
import PartnerLogin from "@/pages/auth/PartnerLogin";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminRestaurants from "@/pages/admin/AdminRestaurants";
import AdminMenuItems from "@/pages/admin/AdminMenuItems";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminLandingPage from "@/pages/admin/AdminLandingPage";
import AdminPartners from "@/pages/admin/AdminPartners";
import AdminCustomers from "@/pages/admin/AdminCustomers";

import PartnerDashboard from "@/pages/partner/PartnerDashboard";
import PartnerOrderHistory from "@/pages/partner/PartnerOrderHistory";
import PartnerReviews from "@/pages/partner/PartnerReviews";
import PartnerPerformance from "@/pages/partner/PartnerPerformance";
import PartnerInvoices from "@/pages/partner/PartnerInvoices";
import PartnerTopProgram from "@/pages/partner/PartnerTopProgram";
import PartnerAdvertising from "@/pages/partner/PartnerAdvertising";
import PartnerPromotions from "@/pages/partner/PartnerPromotions";
import PartnerPayments from "@/pages/partner/PartnerPayments";
import PartnerMenu from "@/pages/partner/PartnerMenu";
import PartnerOpeningTimes from "@/pages/partner/PartnerOpeningTimes";
import PartnerSettings from "@/pages/partner/PartnerSettings";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/restaurants" component={Restaurants} />
      <Route path="/restaurant/:id" component={RestaurantDetail} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/order/:id" component={Order} />
      <Route path="/orders" component={Orders} />
      <Route path="/my-orders" component={MyOrders} />

      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/partner/login" component={PartnerLogin} />

      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/restaurants" component={AdminRestaurants} />
      <Route path="/admin/menu-items" component={AdminMenuItems} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/landing-page" component={AdminLandingPage} />
      <Route path="/admin/partners" component={AdminPartners} />
      <Route path="/admin/customers" component={AdminCustomers} />

      {/* Partner Portal */}
      <Route path="/partner/:partnerId/top-program" component={PartnerTopProgram} />
      <Route path="/partner/:partnerId/orders" component={PartnerOrderHistory} />
      <Route path="/partner/:partnerId/reviews" component={PartnerReviews} />
      <Route path="/partner/:partnerId/performance" component={PartnerPerformance} />
      <Route path="/partner/:partnerId/invoices" component={PartnerInvoices} />
      <Route path="/partner/:partnerId/advertising" component={PartnerAdvertising} />
      <Route path="/partner/:partnerId/promotions" component={PartnerPromotions} />
      <Route path="/partner/:partnerId/payments" component={PartnerPayments} />
      <Route path="/partner/:partnerId/menu" component={PartnerMenu} />
      <Route path="/partner/:partnerId/opening-times" component={PartnerOpeningTimes} />
      <Route path="/partner/:partnerId/settings" component={PartnerSettings} />
      <Route path="/partner/:partnerId" component={PartnerDashboard} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AuthProvider>
          <CartProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </CartProvider>
        </AuthProvider>
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
