import { Link, useLocation } from "wouter";
import { ShoppingCart, User, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();

  const isAdminRoute = location.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link href="/admin" data-testid="link-admin-home">
                  <h1 className="text-2xl font-bold text-primary flex items-center">
                    <Shield className="h-6 w-6 mr-2" />
                    Admin Panel
                  </h1>
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, <span className="font-medium">{user?.name}</span>
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  data-testid="button-logout"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" data-testid="link-home">
              <h1 className="text-2xl font-bold text-primary">
                My Shopping Store
              </h1>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-6">
              <Link
                href="/"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === '/' ? 'text-primary' : 'text-muted-foreground'
                }`}
                data-testid="link-home-nav"
              >
                Home
              </Link>
              <Link
                href="/products"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === '/products' ? 'text-primary' : 'text-muted-foreground'
                }`}
                data-testid="link-products"
              >
                Products
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link href="/cart" data-testid="link-cart">
                    <Button variant="outline" size="sm" className="relative">
                      <ShoppingCart className="h-4 w-4" />
                      {getItemCount() > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                          data-testid="cart-count"
                        >
                          {getItemCount()}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                  
                  <Link href="/dashboard" data-testid="link-dashboard">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={logout}
                    data-testid="button-logout"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" data-testid="link-login">
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link href="/register" data-testid="link-register">
                    <Button size="sm">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <main>
        {children}
      </main>
    </div>
  );
}
