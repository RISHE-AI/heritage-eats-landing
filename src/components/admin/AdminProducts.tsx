import React, { useState, useEffect, useRef } from 'react';
import { fetchProducts as apiFetchProducts, createProduct, updateProduct, uploadProductImage } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Edit, Package, Search, RefreshCw,
  Save, X, Trash2, Languages, Calculator, Upload, Link, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { Product, transformProduct } from '@/types/product';

interface AdminProductsProps {
  password: string;
  onLogout: () => void;
}

const AdminProducts: React.FC<AdminProductsProps> = ({ password, onLogout }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
  }, [password]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = await apiFetchProducts();
      if (result.success && result.data) {
        const transformed = result.data.map((p: any) => transformProduct(p));
        setProducts(transformed);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      if (error.message && (error.message.includes('Not authorized') || error.message.includes('token failed'))) {
        onLogout();
      }
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (product: Product) => {
    try {
      await updateProduct(product.id, { available: !product.available });

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
      const productData = {
        id: editingProduct.id,
        name_en: editingProduct.nameEn,
        name_ta: editingProduct.nameTa,
        category: editingProduct.category,
        basePrice: editingProduct.price,
        description_en: editingProduct.descriptionEn,
        description_ta: editingProduct.descriptionTa,
        images: (editingProduct.images || []).filter(
          img => img && img.trim() !== '' && img !== '/placeholder.svg'
        ),
        ingredients_en: editingProduct.ingredientsEn,
        ingredients_ta: editingProduct.ingredientsTa,
        benefits_en: editingProduct.benefitsEn,
        benefits_ta: editingProduct.benefitsTa,
        storage_en: editingProduct.storageEn,
        storage_ta: editingProduct.storageTa,
        shelfLife: editingProduct.shelfLife,
        available: editingProduct.available,
        weightOptions: editingProduct.weightOptions,
        badge: editingProduct.badge || null
      };

      if (editingProduct._id) {
        await updateProduct(editingProduct._id, productData);
      } else {
        await createProduct(productData);
      }

      toast.success('Product saved successfully');
      setShowEditDialog(false);
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      const msg = error?.message || error?.data?.message || 'Failed to save product';
      toast.error(msg);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const result = await uploadProductImage(file);
      // Filter out placeholder entries before appending the new image
      const existingImages = (editingProduct?.images || []).filter(
        img => img && img.trim() !== '' && img !== '/placeholder.svg'
      );
      const newImages = [...existingImages, result.path];
      setEditingProduct(prev => prev ? { ...prev, images: newImages } : prev);
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    // Filter out placeholder entries before appending the new URL
    const existingImages = (editingProduct?.images || []).filter(
      img => img && img.trim() !== '' && img !== '/placeholder.svg'
    );
    const newImages = [...existingImages, imageUrlInput.trim()];
    setEditingProduct(prev => prev ? { ...prev, images: newImages } : prev);
    setImageUrlInput('');
    toast.success('Image URL added');
  };

  const handleRemoveImage = (index: number) => {
    const newImages = (editingProduct?.images || []).filter((_, i) => i !== index);
    setEditingProduct(prev => prev ? { ...prev, images: newImages } : prev);
  };

  const updateIngredient = (lang: 'En' | 'Ta', index: number, value: string) => {
    if (!editingProduct) return;
    const key = `ingredients${lang}` as keyof Product;
    const ingredients = [...(editingProduct[key] as string[])];
    ingredients[index] = value;
    setEditingProduct({ ...editingProduct, [key]: ingredients });
  };

  const addIngredient = (lang: 'En' | 'Ta') => {
    if (!editingProduct) return;
    const key = `ingredients${lang}` as keyof Product;
    const ingredients = [...(editingProduct[key] as string[]), ''];
    setEditingProduct({ ...editingProduct, [key]: ingredients });
  };

  const removeIngredient = (lang: 'En' | 'Ta', index: number) => {
    if (!editingProduct) return;
    const key = `ingredients${lang}` as keyof Product;
    const ingredients = (editingProduct[key] as string[]).filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, [key]: ingredients });
  };

  const updateBenefit = (lang: 'En' | 'Ta', index: number, value: string) => {
    if (!editingProduct) return;
    const key = `benefits${lang}` as keyof Product;
    const benefits = [...(editingProduct[key] as string[])];
    benefits[index] = value;
    setEditingProduct({ ...editingProduct, [key]: benefits });
  };

  const addBenefit = (lang: 'En' | 'Ta') => {
    if (!editingProduct) return;
    const key = `benefits${lang}` as keyof Product;
    const benefits = [...(editingProduct[key] as string[]), ''];
    setEditingProduct({ ...editingProduct, [key]: benefits });
  };

  const removeBenefit = (lang: 'En' | 'Ta', index: number) => {
    if (!editingProduct) return;
    const key = `benefits${lang}` as keyof Product;
    const benefits = (editingProduct[key] as string[]).filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, [key]: benefits });
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
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[120px] h-10">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={fetchProducts} className="flex-1">
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button size="sm" className="flex-1" onClick={() => {
                setEditingProduct({
                  id: '',
                  nameEn: '',
                  nameTa: '',
                  category: 'sweets',
                  price: 0,
                  descriptionEn: '',
                  descriptionTa: '',
                  images: [],
                  ingredientsEn: [''],
                  ingredientsTa: [''],
                  benefitsEn: [''],
                  benefitsTa: [''],
                  storageEn: '',
                  storageTa: '',
                  shelfLife: '',
                  available: true,
                  weightOptions: []
                });
                setShowEditDialog(true);
              }}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <Card key={product.id} className={`${!product.available ? 'opacity-60' : ''}`}>
            <CardContent className="p-3">
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {product.images?.[0] && product.images[0] !== '/placeholder.svg' ? (
                    <img
                      src={product.images[0]}
                      alt={product.nameEn}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{product.nameEn}</h3>
                      <p className="text-xs text-muted-foreground truncate">{product.nameTa}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {product.category}
                    </Badge>
                  </div>
                  <p className="text-base font-bold mt-1">₹{product.price}</p>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={product.available !== false}
                        onCheckedChange={() => toggleAvailability(product)}
                        className="scale-90"
                      />
                      <span className="text-xs text-muted-foreground">
                        {product.available !== false ? 'On' : 'Off'}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3"
                      onClick={() => {
                        setEditingProduct({
                          ...product,
                          ingredientsEn: product.ingredientsEn?.length ? product.ingredientsEn : [''],
                          ingredientsTa: product.ingredientsTa?.length ? product.ingredientsTa : [''],
                          benefitsEn: product.benefitsEn?.length ? product.benefitsEn : [''],
                          benefitsTa: product.benefitsTa?.length ? product.benefitsTa : [''],
                        });
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No products found
          </CardContent>
        </Card>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Languages className="h-5 w-5" />
              {editingProduct?.id ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
          </DialogHeader>

          {editingProduct && (
            <ScrollArea className="max-h-[calc(90vh-120px)]">
              <div className="p-4 space-y-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 h-10">
                    <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic</TabsTrigger>
                    <TabsTrigger value="ingredients" className="text-xs sm:text-sm">Ingredients</TabsTrigger>
                    <TabsTrigger value="benefits" className="text-xs sm:text-sm">Benefits</TabsTrigger>
                  </TabsList>

                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Name (English)</Label>
                        <Input
                          value={editingProduct.nameEn}
                          onChange={(e) => setEditingProduct({ ...editingProduct, nameEn: e.target.value })}
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Name (Tamil)</Label>
                        <Input
                          value={editingProduct.nameTa}
                          onChange={(e) => setEditingProduct({ ...editingProduct, nameTa: e.target.value })}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Category</Label>
                        <Select
                          value={editingProduct.category}
                          onValueChange={(value: any) => setEditingProduct({ ...editingProduct, category: value })}
                        >
                          <SelectTrigger className="h-9">
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
                        <Label className="text-xs">Base Price (₹)</Label>
                        <Input
                          type="number"
                          value={editingProduct.price}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Description (English)</Label>
                      <Textarea
                        value={editingProduct.descriptionEn}
                        onChange={(e) => setEditingProduct({ ...editingProduct, descriptionEn: e.target.value })}
                        rows={2}
                        className="resize-none"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Description (Tamil)</Label>
                      <Textarea
                        value={editingProduct.descriptionTa}
                        onChange={(e) => setEditingProduct({ ...editingProduct, descriptionTa: e.target.value })}
                        rows={2}
                        className="resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Storage (English)</Label>
                        <Input
                          value={editingProduct.storageEn}
                          onChange={(e) => setEditingProduct({ ...editingProduct, storageEn: e.target.value })}
                          placeholder="e.g., Store in cool, dry place"
                          className="h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Storage (Tamil)</Label>
                        <Input
                          value={editingProduct.storageTa}
                          onChange={(e) => setEditingProduct({ ...editingProduct, storageTa: e.target.value })}
                          placeholder="e.g., குளிர்ந்த இடத்தில் சேமிக்கவும்"
                          className="h-9"
                        />
                      </div>
                    </div>

                    {/* Badge Dropdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Product Badge</Label>
                        <Select
                          value={editingProduct.badge || 'none'}
                          onValueChange={(value: string) => setEditingProduct({ ...editingProduct, badge: value === 'none' ? null : value })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="new">🆕 New</SelectItem>
                            <SelectItem value="hot">🔥 Hot</SelectItem>
                            <SelectItem value="top-seller">⭐ Top Seller</SelectItem>
                            <SelectItem value="limited">⏳ Limited</SelectItem>
                            <SelectItem value="custom">✨ Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={editingProduct.available !== false}
                            onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, available: checked })}
                          />
                          <Label className="text-xs">Available</Label>
                        </div>
                      </div>
                    </div>

                    {/* Weight Auto-Calculator */}
                    <div className="border rounded-lg p-3 space-y-3 bg-secondary/20">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                          <Calculator className="h-4 w-4" />
                          Weight Options
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            const basePrice = editingProduct.price;
                            if (!basePrice || basePrice <= 0) {
                              toast.error('Enter a valid base price first');
                              return;
                            }
                            const pricePerGram = basePrice / 1000;
                            const autoWeights = [
                              { weight: '1', unit: 'kg', price: Math.round(basePrice) },
                              { weight: '500', unit: 'g', price: Math.round(pricePerGram * 500) },
                              { weight: '250', unit: 'g', price: Math.round(pricePerGram * 250) },
                              { weight: '100', unit: 'g', price: Math.round(pricePerGram * 100) },
                            ];
                            setEditingProduct({ ...editingProduct, weightOptions: autoWeights });
                            toast.success('Weight options auto-generated from 1kg price');
                          }}
                        >
                          Auto-Generate from Base Price
                        </Button>
                      </div>

                      {/* Weight Rows */}
                      {(editingProduct.weightOptions || []).map((wo, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            className="h-8 w-20 text-xs"
                            value={wo.weight}
                            onChange={(e) => {
                              const updated = [...(editingProduct.weightOptions || [])];
                              updated[idx] = { ...updated[idx], weight: e.target.value };
                              setEditingProduct({ ...editingProduct, weightOptions: updated });
                            }}
                            placeholder="250"
                          />
                          <Select
                            value={wo.unit}
                            onValueChange={(val: string) => {
                              const updated = [...(editingProduct.weightOptions || [])];
                              updated[idx] = { ...updated[idx], unit: val };
                              setEditingProduct({ ...editingProduct, weightOptions: updated });
                            }}
                          >
                            <SelectTrigger className="h-8 w-16 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="g">g</SelectItem>
                              <SelectItem value="kg">kg</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            className="h-8 w-24 text-xs"
                            type="number"
                            value={wo.price}
                            onChange={(e) => {
                              const updated = [...(editingProduct.weightOptions || [])];
                              updated[idx] = { ...updated[idx], price: Number(e.target.value) };
                              setEditingProduct({ ...editingProduct, weightOptions: updated });
                            }}
                            placeholder="₹"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => {
                              const updated = (editingProduct.weightOptions || []).filter((_, i) => i !== idx);
                              setEditingProduct({ ...editingProduct, weightOptions: updated });
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ))}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs"
                        onClick={() => {
                          const updated = [...(editingProduct.weightOptions || []), { weight: '', unit: 'g', price: 0 }];
                          setEditingProduct({ ...editingProduct, weightOptions: updated });
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Weight
                      </Button>
                    </div>
                    {/* Image Management Section */}
                    <div className="border rounded-lg p-3 space-y-3 bg-secondary/20">
                      <Label className="text-sm font-semibold flex items-center gap-1.5">
                        <ImageIcon className="h-4 w-4" />
                        Product Images
                      </Label>

                      {/* Existing Images Preview */}
                      {(editingProduct.images || []).filter(img => img && img.trim() && img !== '/placeholder.svg').length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(editingProduct.images || []).filter(img => img && img.trim() && img !== '/placeholder.svg').map((img) => {
                            // Find the original index in the unfiltered array for correct removal
                            const originalIdx = (editingProduct.images || []).indexOf(img);
                            const BACKEND = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
                            const src = img.startsWith('http') ? img : `${BACKEND}/${img}`;
                            return (
                              <div key={originalIdx} className="relative group">
                                <img
                                  src={src}
                                  alt={`Product ${originalIdx + 1}`}
                                  className="w-16 h-16 object-cover rounded-lg border"
                                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <button
                                  onClick={() => handleRemoveImage(originalIdx)}
                                  className="absolute -top-1.5 -right-1.5 bg-destructive text-white rounded-full w-4 h-4 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* URL Input */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Link className="h-3 w-3" /> Paste Image URL
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            value={imageUrlInput}
                            onChange={(e) => setImageUrlInput(e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="h-8 text-xs flex-1"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddImageUrl()}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs px-3"
                            onClick={handleAddImageUrl}
                          >
                            Add
                          </Button>
                        </div>
                      </div>

                      {/* File Upload */}
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Upload className="h-3 w-3" /> Upload Image File
                        </Label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                            e.target.value = '';
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full h-8 text-xs"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingImage}
                        >
                          {uploadingImage ? (
                            <><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Uploading...</>
                          ) : (
                            <><Upload className="h-3 w-3 mr-1" /> Choose File to Upload</>
                          )}
                        </Button>
                        <p className="text-[10px] text-muted-foreground mt-1">Max 5MB · JPG, PNG, WebP, GIF</p>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Ingredients Tab */}
                  <TabsContent value="ingredients" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* English Ingredients */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">English</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addIngredient('En')}
                            className="h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {editingProduct.ingredientsEn.map((ingredient, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={ingredient}
                                onChange={(e) => updateIngredient('En', index, e.target.value)}
                                placeholder={`Ingredient ${index + 1}`}
                                className="h-8 text-sm"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeIngredient('En', index)}
                                disabled={editingProduct.ingredientsEn.length <= 1}
                                className="h-8 w-8 shrink-0"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tamil Ingredients */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">Tamil</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addIngredient('Ta')}
                            className="h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {editingProduct.ingredientsTa.map((ingredient, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={ingredient}
                                onChange={(e) => updateIngredient('Ta', index, e.target.value)}
                                placeholder={`பொருள் ${index + 1}`}
                                className="h-8 text-sm"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeIngredient('Ta', index)}
                                disabled={editingProduct.ingredientsTa.length <= 1}
                                className="h-8 w-8 shrink-0"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Benefits Tab */}
                  <TabsContent value="benefits" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* English Benefits */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">English</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addBenefit('En')}
                            className="h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {editingProduct.benefitsEn.map((benefit, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={benefit}
                                onChange={(e) => updateBenefit('En', index, e.target.value)}
                                placeholder={`Benefit ${index + 1}`}
                                className="h-8 text-sm"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeBenefit('En', index)}
                                disabled={editingProduct.benefitsEn.length <= 1}
                                className="h-8 w-8 shrink-0"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tamil Benefits */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-semibold">Tamil</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => addBenefit('Ta')}
                            className="h-7 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {editingProduct.benefitsTa.map((benefit, index) => (
                            <div key={index} className="flex gap-2">
                              <Input
                                value={benefit}
                                onChange={(e) => updateBenefit('Ta', index, e.target.value)}
                                placeholder={`நன்மை ${index + 1}`}
                                className="h-8 text-sm"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeBenefit('Ta', index)}
                                disabled={editingProduct.benefitsTa.length <= 1}
                                className="h-8 w-8 shrink-0"
                              >
                                <Trash2 className="h-3 w-3 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 justify-end pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => setShowEditDialog(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveProduct}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;