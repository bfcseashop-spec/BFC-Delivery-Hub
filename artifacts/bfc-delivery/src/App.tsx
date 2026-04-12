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

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminRestaurants from "@/pages/admin/AdminRestaurants";
import AdminMenuItems from "@/pages/admin/AdminMenuItems";
import AdminLandingPage from "@/pages/admin/AdminLandingPage";

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

      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/restaurants" component={AdminRestaurants} />
      <Route path="/admin/menu-items" component={AdminMenuItems} />
      <Route path="/admin/landing-page" component={AdminLandingPage} />

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
