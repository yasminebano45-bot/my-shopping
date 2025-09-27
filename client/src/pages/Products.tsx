import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Search, Filter, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { useCart } from "@/contexts/CartContext";
import { type Product } from "@shared/schema";

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [location] = useLocation();
  const { addItem } = useCart();

  // Get category from URL if present
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const urlCategory = urlParams.get('category');

  // Build query parameters
  const searchParams = new URLSearchParams();
  if (search) searchParams.set('search', search);
  const selectedCategory = urlCategory || (category !== 'all' ? category : null);
  if (selectedCategory) searchParams.set('category', selectedCategory);
  
  const queryString = searchParams.toString();
  const apiUrl = queryString ? `/api/products?${queryString}` : '/api/products';

  const { data: products = [], isLoading } = useQuery({
    queryKey: [apiUrl],
  });

  // Get unique categories
  const categories = [...new Set(products.map((p: Product) => p.category))];

  // Filter and sort products
  const filteredProducts = products
    .filter((product: Product) => {
      const matchesSearch = !search || 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());
      
      const selectedCategory = urlCategory || (category !== 'all' ? category : null);
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a: Product, b: Product) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">All Products</h1>
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
            
            <Select value={urlCategory || category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48" data-testid="select-sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price-low">Price (Low to High)</SelectItem>
                <SelectItem value="price-high">Price (High to Low)</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                data-testid="button-grid-view"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="ml-1"
                data-testid="button-list-view"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className={`bg-muted rounded-t-lg ${viewMode === 'grid' ? 'aspect-square' : 'h-48 md:h-32'}`}></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-6 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No products found</p>
            <Button onClick={() => {setSearch(''); setCategory('all');}} data-testid="button-clear-filters">
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {filteredProducts.map((product: Product) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                <div className={`overflow-hidden rounded-t-lg ${viewMode === 'list' ? 'md:flex' : ''}`}>
                  <div className={`${viewMode === 'grid' ? 'aspect-square' : 'h-48 md:h-32 md:w-32 md:flex-shrink-0'} overflow-hidden`}>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      data-testid={`img-product-${product.id}`}
                    />
                  </div>
                  <CardContent className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className={`${viewMode === 'list' ? 'flex justify-between items-start' : ''}`}>
                      <div className={`${viewMode === 'list' ? 'flex-1 pr-4' : ''}`}>
                        <Badge variant="secondary" className="mb-2">
                          {product.category}
                        </Badge>
                        <h3 className="font-semibold text-lg mb-2" data-testid={`text-product-name-${product.id}`}>
                          {product.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="text-sm text-muted-foreground mb-3">
                          Stock: {product.stockQuantity} available
                        </div>
                      </div>
                      <div className={`${viewMode === 'list' ? 'text-right' : 'flex items-center justify-between'}`}>
                        <span className="text-2xl font-bold text-primary mb-3 block" data-testid={`text-price-${product.id}`}>
                          ${product.price}
                        </span>
                        <div className={`flex ${viewMode === 'list' ? 'flex-col' : 'items-center'} space-${viewMode === 'list' ? 'y' : 'x'}-2`}>
                          <Link href={`/products/${product.id}`}>
                            <Button variant="outline" size="sm" data-testid={`button-view-${product.id}`}>
                              View Details
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            onClick={() => addItem(product)}
                            disabled={product.stockQuantity === 0}
                            data-testid={`button-add-cart-${product.id}`}
                          >
                            {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
