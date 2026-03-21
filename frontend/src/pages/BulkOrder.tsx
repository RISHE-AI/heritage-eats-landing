import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Trash2, Phone, Mail, FileText, CheckCircle2, ChevronDown, MessageSquare, AlertCircle, Search, Package, Loader2, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion'; 
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { fetchProducts, sendBulkOrderEmailAPI } from '@/services/api';
import { Product, transformProduct } from '@/types/product';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { BACKEND_URL } from '@/services/api';

interface BulkCartItem {
  id: string; // unique cart item id
  product: Product;
  quantity: number;
  selectedWeight: { weight: string; price: number };
}

// Function to safely resolve image paths
function resolveImage(img: string | undefined): string {
  if (!img || img === '/placeholder.svg') return '/placeholder.svg';
  if (img.startsWith('http') || img.startsWith('/images/') || img.startsWith('/placeholder')) return img;
  return `${BACKEND_URL}/${img.replace(/^\//, '')}`;
}

const BilingualLabel = ({ en, ta }: { en: React.ReactNode, ta: React.ReactNode }) => (
  <span className="inline">
    {en} <span className="text-[0.8em] font-normal opacity-75 ml-1">/ {ta}</span>
  </span>
);

const BulkOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectId = searchParams.get('preselect');
  const { user, savedCustomerDetails } = useAuth();
  
  // Data States
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  // Form States
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    message: ''
  });
  
  // Cart States
  const [cartItems, setCartItems] = useState<BulkCartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBox, setShowSearchBox] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Initialize Data
  useEffect(() => {
    // Fill from auth
    if (user || savedCustomerDetails) {
      setFormData(prev => ({
        ...prev,
        name: user?.name || savedCustomerDetails?.name || '',
        phone: user?.phone || savedCustomerDetails?.phone || '',
        email: user?.email || savedCustomerDetails?.email || '',
        address: user?.address || savedCustomerDetails?.address || ''
      }));
    }

    // Fetch Products
    const loadProducts = async () => {
      try {
        const res = await fetchProducts();
        if (res.success && res.data) {
          const transformed = res.data.map((p: any) => transformProduct(p));
          setAvailableProducts(transformed);
          
          // Handle preselect
          if (preselectId) {
            const prod = transformed.find((p: Product) => p.id === preselectId || p._id === preselectId);
            if (prod) {
              const weights = prod.weightOptions && prod.weightOptions.length > 0 
                ? prod.weightOptions 
                : [{ weight: "250g", price: prod.price }];
              
              setCartItems([{
                id: Date.now().toString(),
                product: prod,
                quantity: 10, // Default bulk quantity, could be anything
                selectedWeight: weights[0]
              }]);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load products for bulk order", err);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    
    loadProducts();
  }, [user, savedCustomerDetails, preselectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Cart Functions
  const addProductToCart = (product: Product) => {
    const weights = product.weightOptions && product.weightOptions.length > 0 
      ? product.weightOptions 
      : [{ weight: "Default", price: product.price }];
      
    // Check if already in cart with same weight
    const existing = cartItems.find(item => item.product.id === product.id && item.selectedWeight.weight === weights[0].weight);
    if (existing) {
      updateCartQuantity(existing.id, existing.quantity + 10);
    } else {
      setCartItems(prev => [...prev, {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        product,
        quantity: 10,
        selectedWeight: weights[0]
      }]);
    }
    setSearchQuery('');
    setShowSearchBox(false);
  };

  const removeCartItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: string, newQty: number) => {
    if (newQty < 1) newQty = 1;
    setCartItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
  };

  const updateCartWeight = (id: string, weightString: string) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const product = item.product;
        // fallback weights
        const weights = product.weightOptions && product.weightOptions.length > 0 
          ? product.weightOptions 
          : [{ weight: "Default", price: product.price }];
        const match = weights.find(w => w.weight === weightString) || weights[0];
        return { ...item, selectedWeight: match };
      }
      return item;
    }));
  };

  // Derived Values
  const getFilteredProducts = () => {
    if (!searchQuery) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return availableProducts.filter(p => {
      const enMatch = p.nameEn ? p.nameEn.toLowerCase().includes(lowerQuery) : false;
      const taMatch = p.nameTa ? p.nameTa.toLowerCase().includes(lowerQuery) : false;
      return enMatch || taMatch;
    }).slice(0, 5); // Limit to top 5 hits
  };

  const parseWeightToKg = (weightString: string): number => {
    if (!weightString) return 0;
    const w = weightString.toLowerCase().trim();
    if (w.includes('kg')) {
      const val = parseFloat(w.replace(/[^\d.]/g, ''));
      return isNaN(val) ? 1 : val;
    } else if (w.includes('g') && !w.includes('kg')) {
      const val = parseFloat(w.replace(/[^\d.]/g, ''));
      return isNaN(val) ? 1 : val / 1000;
    } else if (w.includes('l') || w.includes('ml')) {
      const val = parseFloat(w.replace(/[^\d.]/g, ''));
      if (w.includes('ml')) return isNaN(val) ? 1 : val / 1000;
      return isNaN(val) ? 1 : val; 
    }
    return 1;
  };

  const totalWeightInKg = cartItems.reduce((acc, item) => {
    return acc + (parseWeightToKg(item.selectedWeight?.weight) * item.quantity);
  }, 0);

  const courierCharge = cartItems.length > 0 ? Math.max(1, Math.ceil(totalWeightInKg)) * 60 : 0;
  const subtotal = cartItems.reduce((acc, item) => acc + (item.selectedWeight.price * item.quantity), 0);
  const total = cartItems.length > 0 ? subtotal + courierCharge : 0;

  // Formatting for submission
  const getMessageBody = () => {
    const itemsList = cartItems.map(item => 
      `- ${item.product.nameEn} (${item.selectedWeight.weight}): ${item.quantity} Qty @ ₹${item.selectedWeight.price} = ₹${item.selectedWeight.price * item.quantity}`
    ).join('\n');

    return `*BULK ORDER REQUEST*
    
*Customer Details:*
Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email || 'N/A'}
Address: ${formData.address || 'N/A'}

*Requested Items:*
${itemsList}

*Financial Summary:*
- Subtotal: ₹${subtotal}
- Estimated Courier: ₹${courierCharge}
*Est. Total:* ₹${total}

*Special Message:* 
${formData.message || 'None'}`;
  };

  const handleWhatsApp = () => {
    const whatsappNumber = "916383240322";
    const text = encodeURIComponent(getMessageBody());
    window.open(`https://wa.me/${whatsappNumber}?text=${text}`, '_blank');
    setShowSuccessModal(true);
  };

  const handleEmail = async () => {
    setIsSendingEmail(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        message: formData.message,
        subtotal,
        courierCharge,
        total,
        items: cartItems.map(item => ({
          name: item.product.nameEn,
          weight: item.selectedWeight.weight,
          quantity: item.quantity,
          price: item.selectedWeight.price
        }))
      };
      
      const res = await sendBulkOrderEmailAPI(payload);
      if (res.success) {
        setShowSuccessModal(true);
      } else {
        toast.error("Failed to place your request. Please try WhatsApp.");
      }
    } catch (error) {
       toast.error("Network error. Could not send the request.");
    } finally {
       setIsSendingEmail(false);
    }
  };

  const isValid = formData.name.trim() !== '' && formData.phone.trim() !== '' && cartItems.length > 0;

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden flex flex-col">
      <Header />
      
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/15 via-primary/5 to-background pt-20 pb-8 md:pt-28 md:pb-24 border-b">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/10 rounded-[100%] blur-3xl pointer-events-none"></div>

        <div className="container relative mx-auto px-4 sm:px-6 max-w-5xl z-10 w-full">
          <Button variant="outline" size="sm" className="mb-4 md:mb-8 border-primary/20 hover:bg-primary/10 transition-colors rounded-full backdrop-blur-md bg-background/50 text-foreground text-xs md:text-sm shadow-sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" /> Back / திரும்பு
          </Button>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-serif text-3xl md:text-5xl font-bold mb-2 md:mb-4 text-foreground tracking-tight drop-shadow-sm leading-tight break-words">
              <span className="block md:inline">Request <span className="text-primary">Bulk Order</span></span>
              <span className="block text-xl md:text-3xl text-primary/80 mt-1 md:mt-2 font-normal">மொத்த ஆர்டர் கோரிக்கை</span>
            </h1>
            <p className="text-sm md:text-lg text-muted-foreground leading-relaxed max-w-2xl break-words">
              Select multiple products and configure quantities for weddings, festivals, or corporate events. Let us package your vision!
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-6 md:py-16 max-w-5xl w-full pb-40 lg:pb-16 flex-1">
        <div className="grid lg:grid-cols-12 gap-6 md:gap-8 items-start">
          
          {/* Main Form Area */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6 w-full min-w-0">
            
            {/* Products Selection Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Card className="rounded-2xl md:rounded-3xl shadow-xl shadow-primary/5 border border-primary/10 overflow-visible z-20 hover:border-primary/20 transition-all duration-300 w-full">
                <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pb-4 rounded-t-2xl md:rounded-t-3xl px-4 md:px-6">
                  <CardTitle className="flex items-center gap-3 text-lg md:text-2xl font-serif text-primary">
                    <div className="p-2 bg-primary/15 rounded-xl text-primary shrink-0">
                      <Package className="h-4 w-4 md:h-6 md:w-6" />
                    </div>
                    <BilingualLabel en="Products" ta="பொருட்கள்" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 md:p-6 space-y-4 md:space-y-6 w-full">
                  
                  {/* Selected Products List */}
                  {cartItems.length > 0 ? (
                    <div className="space-y-3 w-full">
                      {cartItems.map((item, index) => {
                        const productWeights = item.product.weightOptions && item.product.weightOptions.length > 0 
                          ? item.product.weightOptions 
                          : [{ weight: "250g", price: item.product.price }];
                          
                        return (
                          <motion.div 
                            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}
                            key={item.id} 
                            className="flex flex-col sm:flex-row gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl border border-border/80 bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-200 items-start sm:items-center relative w-full"
                          >
                            <div className="flex gap-3 w-full sm:w-auto flex-1 min-w-0">
                              <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-secondary/30 ring-1 ring-border shadow-inner">
                                <img src={resolveImage(item.product.images?.[0])} alt={item.product.nameEn} className="w-full h-full object-cover" />
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm sm:text-base text-foreground line-clamp-1 break-words">{item.product.nameEn}</h4>
                                <p className="text-[11px] md:text-xs text-muted-foreground tamil-text line-clamp-1">{item.product.nameTa}</p>
                                <div className="mt-2 flex flex-wrap gap-2 items-center">
                                  <select 
                                    value={item.selectedWeight.weight}
                                    onChange={(e) => updateCartWeight(item.id, e.target.value)}
                                    className="text-[11px] md:text-xs py-1.5 md:py-2 px-2 md:px-3 rounded-lg border border-primary/20 bg-background hover:bg-secondary/20 cursor-pointer font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all max-w-full text-ellipsis"
                                  >
                                    {productWeights.map((w, i) => (
                                      <option key={i} value={w.weight}>{w.weight} (₹{w.price})</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t border-border/50 sm:border-0 pl-0 sm:pl-2 shrink-0 gap-3">
                              <div className="flex items-center border border-primary/20 rounded-lg overflow-hidden bg-background shadow-sm shrink-0">
                                <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="px-2 md:px-3 py-1.5 hover:bg-primary/10 transition-colors font-medium text-muted-foreground hover:text-foreground">-</button>
                                <input 
                                  type="number" 
                                  value={item.quantity} 
                                  onChange={(e) => updateCartQuantity(item.id, parseInt(e.target.value) || 1)}
                                  className="w-8 md:w-12 text-center text-[11px] md:text-xs font-bold bg-transparent outline-none border-x border-primary/10"
                                  min="1"
                                />
                                <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="px-2 md:px-3 py-1.5 hover:bg-primary/10 transition-colors font-medium text-muted-foreground hover:text-foreground">+</button>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="font-bold text-sm md:text-base text-primary mr-1">₹{item.selectedWeight.price * item.quantity}</span>
                                <Button variant="ghost" size="icon" onClick={() => removeCartItem(item.id)} className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive shrink-0 rounded-lg transition-colors">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                      )})}
                    </div>
                  ) : (
                    <div className="text-center py-6 md:py-8 border-2 border-dashed rounded-xl bg-secondary/10 w-full mb-2">
                      <Package className="h-6 w-6 md:h-8 md:w-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-sm font-medium text-muted-foreground"><BilingualLabel en="No products added yet." ta="பொருட்கள் சேர்க்கப்படவில்லை." /></p>
                    </div>
                  )}

                  {/* Add Product Search Toggle */}
                  <div className="relative w-full">
                    {!showSearchBox ? (
                      <Button 
                        variant="outline" 
                        className="w-full border-dashed h-12 rounded-xl" 
                        onClick={() => setShowSearchBox(true)}
                        disabled={isLoadingProducts}
                      >
                        {isLoadingProducts ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                        <span className="font-semibold text-sm"><BilingualLabel en="Add Product" ta="பொருளைச் சேர்" /></span>
                      </Button>
                    ) : (
                      <div className="space-y-2 relative z-50 w-full">
                        <Label className="text-xs md:text-sm"><BilingualLabel en="Search Products" ta="பொருட்களை தேடுங்கள்" /></Label>
                        <div className="relative flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                              autoFocus
                              placeholder="Type to search..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-9 h-11 w-full text-base" /* text-base prevents iOS zoom */
                            />
                          </div>
                          <Button variant="ghost" onClick={() => setShowSearchBox(false)} className="h-11 px-3 text-xs shrink-0 bg-secondary/20 hover:bg-secondary transition-colors rounded-xl">Cancel</Button>
                        </div>
                        
                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                          {searchQuery.trim().length > 0 && (
                            <motion.div 
                              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              className="absolute top-full left-0 right-0 mt-1 bg-background border shadow-xl rounded-xl overflow-hidden z-50 max-h-60 overflow-y-auto w-full"
                            >
                              {getFilteredProducts().length > 0 ? (
                                <ul className="py-1 w-full">
                                  {getFilteredProducts().map(prod => (
                                    <li 
                                      key={prod.id} 
                                      className="px-4 py-3 hover:bg-secondary/40 cursor-pointer flex items-center justify-between border-b last:border-0"
                                      onClick={() => addProductToCart(prod)}
                                    >
                                      <div className="flex-1 min-w-0 pr-3">
                                        <p className="text-sm font-bold line-clamp-1 break-words">{prod.nameEn}</p>
                                        <p className="text-[10px] text-muted-foreground tamil-text line-clamp-1">{prod.nameTa}</p>
                                      </div>
                                      <Button size="sm" variant="secondary" className="h-7 text-xs rounded-full shrink-0">Add</Button>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <div className="p-4 text-center text-sm text-muted-foreground w-full">No matching products found.</div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                  
                </CardContent>
              </Card>
            </motion.div>

            {/* Customer Details Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card className="rounded-2xl md:rounded-3xl shadow-xl shadow-primary/5 border border-primary/10 overflow-hidden z-10 relative hover:border-primary/20 transition-all duration-300 w-full">
                <CardHeader className="border-b border-primary/10 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pb-4 px-4 md:px-6">
                  <CardTitle className="flex items-center gap-3 text-lg md:text-2xl font-serif text-primary">
                    <div className="p-2 bg-primary/15 rounded-xl text-primary shrink-0">
                      <Mail className="h-4 w-4 md:h-6 md:w-6" />
                    </div>
                    <BilingualLabel en="Your Details" ta="உங்கள் விவரங்கள்" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-4 md:space-y-5 w-full">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                    <div className="space-y-1.5 group">
                      <Label htmlFor="name" className="text-xs md:text-sm font-medium group-focus-within:text-primary transition-colors"><BilingualLabel en="Name / Company" ta="பெயர்" /> <span className="text-destructive">*</span></Label>
                      <Input id="name" name="name" value={formData.name} onChange={handleChange} className="h-11 md:h-12 rounded-xl bg-secondary/10 border-border/50 focus:border-primary/50 focus:bg-background transition-all text-base md:text-sm" />
                    </div>
                    <div className="space-y-1.5 group">
                      <Label htmlFor="phone" className="text-xs md:text-sm font-medium group-focus-within:text-primary transition-colors"><BilingualLabel en="Contact Number" ta="தொலைபேசி" /> <span className="text-destructive">*</span></Label>
                      <Input id="phone" name="phone" value={formData.phone} type="tel" onChange={handleChange} className="h-11 md:h-12 rounded-xl bg-secondary/10 border-border/50 focus:border-primary/50 focus:bg-background transition-all text-base md:text-sm" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 group">
                    <Label htmlFor="email" className="text-xs md:text-sm font-medium group-focus-within:text-primary transition-colors"><BilingualLabel en="Email (Optional)" ta="மின்னஞ்சல்" /></Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="h-11 md:h-12 rounded-xl bg-secondary/10 border-border/50 focus:border-primary/50 focus:bg-background transition-all text-base md:text-sm" placeholder="For quotes & invoices" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <Label htmlFor="address" className="text-xs md:text-sm"><BilingualLabel en="Delivery Address (Optional)" ta="டெலிவரி முகவரி" /></Label>
                    <Textarea id="address" name="address" value={formData.address} onChange={handleChange} className="min-h-[80px] rounded-lg resize-y text-base md:text-sm" placeholder="Where should we deliver this bulk order?" />
                  </div>

                  <div className="space-y-1.5 pt-2 border-t">
                    <Label htmlFor="message" className="text-xs md:text-sm font-semibold text-primary"><BilingualLabel en="Special Requirements" ta="சிறப்பு தேவைகள்" /></Label>
                    <Textarea id="message" name="message" value={formData.message} onChange={handleChange} className="min-h-[80px] rounded-lg border-primary/20 bg-primary/5 focus-visible:ring-primary h-[100px] text-base md:text-sm" placeholder="Specific event date, extra spicy, custom packaging labels, etc." />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Summary Desktop (Hidden Submits on Mobile) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 w-full min-w-0">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <Card className="rounded-2xl md:rounded-3xl shadow-xl lg:shadow-2xl shadow-primary/10 border-primary/20 overflow-hidden bg-gradient-to-br from-card to-primary/5 backdrop-blur-xl ring-1 ring-primary/20 w-full border-t">
                <CardHeader className="bg-primary/10 border-b border-primary/15 pb-4 md:pb-5 px-4 md:px-6">
                  <CardTitle className="font-serif text-lg md:text-2xl flex items-center justify-between text-foreground">
                    <BilingualLabel en="Order Summary" ta="சுருக்கம்" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-4 md:space-y-5 w-full">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-muted-foreground"><BilingualLabel en="Item Subtotal" ta="பொருட்கள் விலை" /></span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-muted-foreground flex flex-col items-start gap-0.5">
                      <BilingualLabel en="Est. Courier" ta="கூரியர் கட்டணம்" />
                      {cartItems.length > 0 && <span className="text-[10px] text-muted-foreground/70">({totalWeightInKg > 0 ? totalWeightInKg.toFixed(2) : 0} kg @ ₹60/kg)</span>}
                    </span>
                    <span className={cartItems.length > 0 ? "text-foreground" : "text-muted-foreground"}>
                      {cartItems.length > 0 ? `₹${courierCharge.toFixed(2)}` : '—'}
                    </span>
                  </div>
                  
                  <div className="border-t border-primary/20 pt-4 md:pt-5 mt-1 flex justify-between items-center font-bold">
                    <span className="text-base md:text-lg text-foreground"><BilingualLabel en="Est. Total" ta="மொத்தம்" /></span>
                    <span className="text-xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-500 drop-shadow-sm">₹{total.toFixed(2)}</span>
                  </div>

                  <div className="rounded-xl bg-orange-50 dark:bg-orange-950/30 p-3 mt-3 md:mt-4 border border-orange-200 dark:border-orange-800/40 flex gap-2 items-start w-full">
                    <span className="text-orange-500 mt-0.5 shrink-0 text-sm">⏱️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] md:text-xs font-bold text-orange-800 dark:text-orange-300 break-words">Est. Preparation: 5-7 Days</p>
                      <p className="text-[9px] md:text-[10px] text-orange-700/80 dark:text-orange-400/80 tamil-text">தயாரிப்பு நேரம்: 5-7 நாட்கள்</p>
                    </div>
                  </div>
                </CardContent>
                {/* Desktop Action Buttons (Hidden Submits on Mobile) */}
                <CardFooter className="hidden lg:flex bg-card/50 p-5 md:p-6 flex-col gap-4 border-t border-primary/10 w-full">
                  <Button 
                    onClick={handleEmail} 
                    disabled={!isValid || isSendingEmail}
                    className="w-full h-12 md:h-14 gap-2 rounded-xl md:rounded-2xl text-sm md:text-base shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all font-semibold"
                  >
                    {isSendingEmail ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />} 
                    {isSendingEmail ? "Sending Setup..." : "Send Request via Email"}
                  </Button>
                  <Button 
                    onClick={handleWhatsApp}  
                    disabled={!isValid}
                    variant="outline"
                    className="w-full h-12 md:h-14 gap-2 rounded-xl md:rounded-2xl text-sm md:text-base font-semibold hover:bg-green-600 hover:text-white border-green-600/30 text-green-700 transition-all shadow-sm"
                  >
                    <MessageSquare className="h-5 w-5" /> Send via WhatsApp
                  </Button>
                  
                  {!isValid && (
                    <p className="text-[11px] text-center text-red-500/80 font-medium w-full">
                      * Add products, your Name, and Phone to request quotes.
                    </p>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Bar for Actions */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.15)] ring-1 ring-border">
        <div className="px-4 py-3 sm:px-6 w-full max-w-5xl mx-auto flex flex-col gap-2.5">
          <div className="flex items-center justify-between w-full">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Est.</span>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-500">₹{total.toFixed(2)}</span>
          </div>
          <div className="flex w-full gap-2">
            <Button 
              onClick={handleWhatsApp}  
              disabled={!isValid}
              variant="outline"
              className="flex-1 h-12 gap-1 rounded-xl text-xs sm:text-sm font-bold border-green-600/30 text-green-700 bg-green-50/50 hover:bg-green-600 hover:text-white transition-all shadow-sm"
            >
              <MessageSquare className="h-4 w-4 shrink-0" /> WhatsApp
            </Button>
            <Button 
              onClick={handleEmail} 
              disabled={!isValid || isSendingEmail}
              className="flex-1 h-12 gap-1 rounded-xl text-xs sm:text-sm shadow-lg shadow-primary/20 transition-all font-bold tracking-wide"
            >
              {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : <Mail className="h-4 w-4 shrink-0" />} 
              Email
            </Button>
          </div>
          {!isValid && (
            <p className="text-[10px] text-center text-red-500/80 font-medium">
              * Add products, Name, and Phone to request.
            </p>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="w-[90vw] max-w-md rounded-3xl p-6 md:p-8 text-center bg-card shadow-2xl z-[100]">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 ring-8 ring-primary/5">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl md:text-2xl font-serif text-foreground mb-2 text-center break-words">Thanks for your Request!</DialogTitle>
          </DialogHeader>
          <div className="mb-6 space-y-3">
            <DialogDescription className="text-sm md:text-base text-muted-foreground text-center">
              Your inquiry has been formulated and sent successfully.
            </DialogDescription>
            <p className="text-xs md:text-sm font-medium text-primary bg-primary/5 p-3 rounded-xl border border-primary/20 leading-relaxed text-left">
              The Admin will review your massive order request and reply to you soon regarding exact shipping costs and dates!
            </p>
          </div>
          <DialogFooter className="sm:justify-center w-full mt-2">
            <Button onClick={() => navigate('/')} className="w-full h-12 px-8 rounded-xl font-bold shadow-md hover:shadow-lg transition-all">
              Return to Home Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BulkOrder;
