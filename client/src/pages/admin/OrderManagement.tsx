import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Package, Clock, CheckCircle, XCircle, Eye, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

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

const statusOptions = ["Pending", "Shipped", "Delivered", "Cancelled"];

export default function OrderManagement() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { toast } = useToast();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['/api/admin/orders'],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest('PUT', `/api/admin/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Order status updated",
        description: "The order status has been successfully updated.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = !search || 
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  return (
    <ProtectedRoute adminOnly>
      <Layout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Order Management</h1>
            <p className="text-muted-foreground">
              View and manage customer orders
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search orders by ID, customer name, or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search-orders"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Orders ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-6 bg-muted rounded"></div>
                    </div>
                  ))}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                  <p className="text-muted-foreground">
                    {search || statusFilter !== "all" 
                      ? "Try adjusting your filters" 
                      : "No orders have been placed yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((order: any) => {
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
                                {new Date(order.createdAt).toLocaleDateString()} at{" "}
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="font-semibold text-lg" data-testid={`text-order-total-${order.id}`}>
                              ${order.totalPrice}
                            </span>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                  data-testid={`button-view-order-${order.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>
                                    Order #{order.id.slice(-8).toUpperCase()}
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedOrder && (
                                  <div className="space-y-4">
                                    {/* Customer Info */}
                                    <div>
                                      <h4 className="font-semibold mb-2">Customer Information</h4>
                                      <div className="bg-muted/50 p-3 rounded-md">
                                        <p><strong>Name:</strong> {selectedOrder.user?.name}</p>
                                        <p><strong>Email:</strong> {selectedOrder.user?.email}</p>
                                        <p><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                      </div>
                                    </div>

                                    {/* Shipping Address */}
                                    <div>
                                      <h4 className="font-semibold mb-2">Shipping Address</h4>
                                      <div className="bg-muted/50 p-3 rounded-md">
                                        <p>{selectedOrder.shippingAddress}</p>
                                      </div>
                                    </div>

                                    {/* Order Items */}
                                    <div>
                                      <h4 className="font-semibold mb-2">Order Items</h4>
                                      <div className="space-y-3">
                                        {selectedOrder.items?.map((item: any) => (
                                          <div key={item.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-md">
                                            <img
                                              src={item.product.imageUrl}
                                              alt={item.product.name}
                                              className="w-12 h-12 object-cover rounded"
                                            />
                                            <div className="flex-1">
                                              <p className="font-medium">{item.product.name}</p>
                                              <p className="text-sm text-muted-foreground">
                                                Qty: {item.quantity} × ${item.price}
                                              </p>
                                            </div>
                                            <p className="font-semibold">
                                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Order Total */}
                                    <div className="border-t pt-4">
                                      <div className="flex justify-between text-lg font-semibold">
                                        <span>Total:</span>
                                        <span>${selectedOrder.totalPrice}</span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>

                        {/* Customer and Status */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Customer</p>
                            <p className="font-medium">{order.user?.name}</p>
                            <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Items</p>
                            <p className="font-medium">
                              {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Status</p>
                            <div className="flex items-center space-x-2">
                              <Badge variant={statusColors[order.status as keyof typeof statusColors]}>
                                {order.status}
                              </Badge>
                              <Select
                                value={order.status}
                                onValueChange={(value) => handleStatusChange(order.id, value)}
                                disabled={updateStatusMutation.isPending}
                              >
                                <SelectTrigger className="w-32" data-testid={`select-status-${order.id}`}>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((status) => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        {/* Shipping Address Preview */}
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground">Shipping Address</p>
                          <p className="text-sm">{order.shippingAddress}</p>
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
