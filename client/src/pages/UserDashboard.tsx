import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Package, Clock, CheckCircle, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

const statusIcons = {
  Pending: Clock,
  Shipped: Package,
  Delivered: CheckCircle,
  Cancelled: XCircle,
};

const statusColors = {
  Pending: "default",
  Shipped: "secondary",
  Delivered: "default",
  Cancelled: "destructive",
} as const;

export default function UserDashboard() {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/orders'],
  });

  return (
    <ProtectedRoute>
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
            <p className="text-muted-foreground">Here's an overview of your account and recent orders.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-total-orders">
                      {orders.length}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-secondary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-pending-orders">
                      {orders.filter((order: any) => order.status === 'Pending').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Pending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-delivered-orders">
                      {orders.filter((order: any) => order.status === 'Delivered').length}
                    </p>
                    <p className="text-sm text-muted-foreground">Delivered</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                    <Package className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" data-testid="text-total-spent">
                      ${orders.reduce((sum: number, order: any) => sum + parseFloat(order.totalPrice), 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-6 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground mb-4">Start shopping to see your orders here.</p>
                  <Link href="/products">
                    <Button data-testid="button-start-shopping">Start Shopping</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order: any) => {
                    const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
                    return (
                      <div key={order.id} className="border rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <StatusIcon className="h-5 w-5" />
                            <div>
                              <h3 className="font-semibold" data-testid={`text-order-id-${order.id}`}>
                                Order #{order.id.slice(-8).toUpperCase()}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant={statusColors[order.status as keyof typeof statusColors]}>
                              {order.status}
                            </Badge>
                            <span className="font-semibold" data-testid={`text-order-total-${order.id}`}>
                              ${order.totalPrice}
                            </span>
                          </div>
                        </div>

                        {order.items && order.items.length > 0 && (
                          <div className="space-y-3">
                            <Separator />
                            <h4 className="font-medium text-sm">Items:</h4>
                            <div className="grid gap-3">
                              {order.items.map((item: any) => (
                                <div key={item.id} className="flex items-center space-x-3">
                                  <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                    <img
                                      src={item.product.imageUrl}
                                      alt={item.product.name}
                                      className="w-full h-full object-cover"
                                      data-testid={`img-order-item-${item.id}`}
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm" data-testid={`text-item-name-${item.id}`}>
                                      {item.product.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      Qty: {item.quantity} × ${item.price}
                                    </p>
                                  </div>
                                  <p className="font-medium text-sm">
                                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              <p><strong>Shipping Address:</strong></p>
                              <p>{order.shippingAddress}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-view-order-${order.id}`}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
