import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, Edit, Trash2, Package, Search, RefreshCw, 
  Eye, EyeOff, Save, X 
} from 'lucide-react';
import { toast } from 'sonner';
import { products as staticProducts } from '@/data/products';
import { Product } from '@/types/product';

interface AdminProductsProps {
  password: string;
}

const AdminProducts: React.FC<AdminProductsProps> = ({ password }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [password]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin', {
        body: { action: 'getProducts', password }
      });

      if (error) throw error;
      
      // Merge MongoDB products with static products
      const dbProducts = data?.products || [];
      const mergedProducts = [...staticProducts];
      
      // Update static products with any saved availability changes from DB
      dbProducts.forEach((dbProduct: any) => {
        const index = mergedProducts.findIndex(p => p.id === dbProduct.id);
        if (index !== -1) {
          mergedProducts[index] = { ...mergedProducts[index], available: dbProduct.available };
        }
      });
      
      setProducts(mergedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Fall back to static products
      setProducts(staticProducts);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      const { error } = await supabase.functions.invoke('admin', {
        body: { 
          action: 'setProductAvailability', 
          password,
          productId: product.id,
          available: !product.available
        }
      });

      if (error) throw error;
      
      setProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, available: !p.available } : p
      ));
      
      toast.success(`${product.nameEn} is now ${!product.available ? 'available' : 'unavailable'}`);
    } catch (error) {
      console.error('Error updating availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const saveProduct = async () => {
    if (!editingProduct) return;
    
    try {
      const { error } = await supabase.functions.invoke('admin', {
        body: { 
          action: 'saveProduct', 
          password,
          product: editingProduct
        }
      });

      if (error) throw error;
      
      toast.success('Product saved successfully');
      setShowEditDialog(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const deleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const { error } = await supabase.functions.invoke('admin', {
        body: { 
          action: 'deleteProduct', 
          password,
          productId
        }
      });

      if (error) throw error;
      
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.nameTa.includes(searchQuery);
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['sweets', 'snacks', 'pickles', 'malts', 'podi'];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2 w-full sm:w-auto flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={fetchProducts}>
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={() => {
                setEditingProduct({
                  id: '',
                  nameEn: '',
                  nameTa: '',
                  category: 'sweets',
                  price: 0,
                  descriptionEn: '',
                  descriptionTa: '',
                  images: ['/placeholder.svg'],
                  ingredientsEn: [],
                  ingredientsTa: [],
                  benefitsEn: [],
                  benefitsTa: [],
                  storageEn: '',
                  storageTa: '',
                  shelfLife: '',
                  available: true,
                  weightOptions: []
                });
                setShowEditDialog(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className={`${!product.available ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                  {product.images?.[0] && product.images[0] !== '/placeholder.svg' ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.nameEn} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold truncate">{product.nameEn}</h3>
                      <p className="text-sm text-muted-foreground truncate">{product.nameTa}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {product.category}
                    </Badge>
                  </div>
                  <p className="text-lg font-bold mt-1">₹{product.price}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Switch
                      checked={product.available !== false}
                      onCheckedChange={() => toggleAvailability(product)}
                    />
                    <span className="text-xs text-muted-foreground">
                      {product.available !== false ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => {
                    setEditingProduct(product);
                    setShowEditDialog(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No products found matching your criteria
          </CardContent>
        </Card>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct?.id ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>
          
          {editingProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name (English)</Label>
                  <Input
                    value={editingProduct.nameEn}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nameEn: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Name (Tamil)</Label>
                  <Input
                    value={editingProduct.nameTa}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nameTa: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select 
                    value={editingProduct.category} 
                    onValueChange={(value: any) => setEditingProduct({ ...editingProduct, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Base Price (₹)</Label>
                  <Input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label>Description (English)</Label>
                <Textarea
                  value={editingProduct.descriptionEn}
                  onChange={(e) => setEditingProduct({ ...editingProduct, descriptionEn: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label>Description (Tamil)</Label>
                <Textarea
                  value={editingProduct.descriptionTa}
                  onChange={(e) => setEditingProduct({ ...editingProduct, descriptionTa: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label>Shelf Life</Label>
                <Input
                  value={editingProduct.shelfLife}
                  onChange={(e) => setEditingProduct({ ...editingProduct, shelfLife: e.target.value })}
                  placeholder="e.g., 15-20 days"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingProduct.available !== false}
                  onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, available: checked })}
                />
                <Label>Product Available</Label>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={saveProduct}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Product
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;
