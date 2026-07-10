'use client';
import { useState, useEffect } from 'react';
import { getAllProducts, formatPrice } from '@/lib/products';
import { addProductToFirestore, updateProductInFirestore, deleteProductFromFirestore } from '@/lib/firestore';
import styles from '../admin.module.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    brand: '',
    category: '',
    collection: '',
    price: 0,
    originalPrice: 0,
    badge: '',
    description: '',
    features: '',
    colorVariants: '',
    sizeVariants: '',
    stock: 0,
    image: '',
    imageFile: null,
    inStock: true,
    freeShipping: true,
  });

  const fetchProducts = async () => {
    setLoading(true);
    const fetched = await getAllProducts();
    setProducts(fetched);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        id: product.id,
        name: product.name || '',
        brand: product.brand || '',
        category: product.category || '',
        collection: product.collection || '',
        price: product.price || 0,
        originalPrice: product.originalPrice || 0,
        badge: product.badge || '',
        description: product.description || '',
        features: product.features ? product.features.join('\n') : '',
        colorVariants: product.variants?.color ? product.variants.color.join(', ') : '',
        sizeVariants: product.variants?.size ? product.variants.size.join(', ') : '',
        stock: product.stock || 42,
        image: product.image || '',
        imageFile: null,
        inStock: product.inStock !== false,
        freeShipping: product.freeShipping !== false,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        id: '',
        name: '',
        brand: '',
        category: '',
        collection: '',
        price: 0,
        originalPrice: 0,
        badge: '',
        description: '',
        features: '',
        colorVariants: '',
        sizeVariants: '',
        stock: 0,
        image: '',
        imageFile: null,
        inStock: true,
        freeShipping: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    let imageUrl = formData.image;
    
    // Upload image if selected
    if (formData.imageFile) {
      if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME && process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
        // Direct browser-to-Cloudinary upload (Bypasses Vercel server limits)
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
        
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', formData.imageFile);
        cloudinaryFormData.append('upload_preset', uploadPreset);
        
        try {
          const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: cloudinaryFormData,
          });
          
          const cloudinaryData = await cloudinaryRes.json();
          if (cloudinaryData.secure_url) {
            imageUrl = cloudinaryData.secure_url;
          } else {
            throw new Error(cloudinaryData.error?.message || 'Cloudinary upload failed');
          }
        } catch (err) {
          console.error(err);
          alert('Failed to upload image directly to Cloudinary. Please check your Cloud Name and Upload Preset in Vercel.');
          setLoading(false);
          return;
        }
      } else {
        // Fallback to local server API (Works on localhost, fails on Vercel)
        const formPayload = new FormData();
        formPayload.append('file', formData.imageFile);
        
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formPayload,
          });
          
          if (!res.ok) {
            throw new Error('Upload failed');
          }
          
          const uploadRes = await res.json();
          
          if (uploadRes.error) {
            alert(uploadRes.error);
            setLoading(false);
            return;
          }
          imageUrl = uploadRes.url;
        } catch (err) {
          console.error(err);
          alert('Failed to upload image to local server. Please use a smaller file or configure Cloudinary.');
          setLoading(false);
          return;
        }
      }
    }
    
    // Parse arrays
    const featuresArray = formData.features.split('\n').map(f => f.trim()).filter(Boolean);
    const colorArray = formData.colorVariants.split(',').map(c => c.trim()).filter(Boolean);
    const sizeArray = formData.sizeVariants.split(',').map(s => s.trim()).filter(Boolean);
    
    const dataToSave = {
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      collection: formData.collection,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice) || null,
      badge: formData.badge,
      description: formData.description,
      features: featuresArray,
      variants: {
        color: colorArray.length > 0 ? colorArray : undefined,
        size: sizeArray.length > 0 ? sizeArray : undefined,
      },
      stock: Number(formData.stock),
      image: imageUrl,
      inStock: formData.inStock,
      freeShipping: formData.freeShipping,
    };

    // Remove empty variant arrays entirely to prevent Firebase errors
    if (colorArray.length === 0) delete dataToSave.variants.color;
    if (sizeArray.length === 0) delete dataToSave.variants.size;
    if (Object.keys(dataToSave.variants).length === 0) delete dataToSave.variants;

    // Remove undefined properties
    Object.keys(dataToSave).forEach(key => dataToSave[key] === undefined && delete dataToSave[key]);
    
    try {
      if (editingProduct) {
        await updateProductInFirestore(editingProduct.id, dataToSave);
      } else {
        const newId = formData.id || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        await addProductToFirestore({
          id: newId,
          ...dataToSave,
        });
      }
      handleCloseModal();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Ensure you have admin permissions.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <input type="text" className="input" placeholder="Search products..." style={{ width: '300px' }} />
          <select className="input select">
            <option>All Categories</option>
            <option>Audio</option>
            <option>Workspace</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}><path d="M12 5v14M5 12h14"/></svg>
          Add Product
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading products...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Image</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div style={{ width: '40px', height: '40px', background: '#E5E7EB', borderRadius: '4px' }}></div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '500' }}>{product.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>{product.brand}</div>
                  </td>
                  <td>{product.category}</td>
                  <td style={{ fontWeight: '500' }}>{formatPrice(product.price)}</td>
                  <td>{product.stock || 42}</td>
                  <td>
                    {product.inStock ? (
                      <span className={`${styles.badge} ${styles.badgeSuccess}`}>In Stock</span>
                    ) : (
                      <span className={`${styles.badge} ${styles.badgeError}`}>Out of Stock</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-outline btn-sm" style={{ marginRight: '8px' }} onClick={() => handleOpenModal(product)}>Edit</button>
                    <button className="btn btn-outline btn-sm" style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }} onClick={() => alert('Delete coming soon')}>Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No products found. Add your first product!</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '800px',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginBottom: '24px', fontSize: '1.5rem', fontWeight: 'bold' }}>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* SECTION: Basic Info */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: 'var(--color-primary)', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Basic Information</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  {!editingProduct && (
                    <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                      <label className="input-label">Product ID (optional)</label>
                      <input className="input" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} placeholder="Leaves blank to auto-generate" />
                    </div>
                  )}
                  <div className="input-group">
                    <label className="input-label">Product Name *</label>
                    <input className="input" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Zen Pro Headphones" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Brand *</label>
                    <input className="input" required value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} placeholder="e.g. ZAMEON Audio" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Category *</label>
                    <input className="input" required list="category-options" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="Select or type new" />
                    <datalist id="category-options">
                      <option value="Audio" />
                      <option value="Wearables" />
                      <option value="Workspace" />
                      <option value="Accessories" />
                      <option value="Lifestyle" />
                      <option value="Home" />
                    </datalist>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Collection</label>
                    <input className="input" value={formData.collection} onChange={(e) => setFormData({...formData, collection: e.target.value})} placeholder="e.g. Signature Series" />
                  </div>
                </div>
              </div>

              {/* SECTION: Pricing & Status */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: 'var(--color-primary)', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Pricing & Status</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">Sale Price (INR) *</label>
                    <input type="number" className="input" required value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Original Price (INR)</label>
                    <input type="number" className="input" value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: e.target.value})} placeholder="Optional MRP" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Badge Label</label>
                    <input className="input" value={formData.badge} onChange={(e) => setFormData({...formData, badge: e.target.value})} placeholder="e.g. Best Seller" />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">Stock Quantity</label>
                    <input type="number" className="input" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '24px' }}>
                    <input type="checkbox" checked={formData.inStock} onChange={(e) => setFormData({...formData, inStock: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontWeight: '500' }}>In Stock</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '24px' }}>
                    <input type="checkbox" checked={formData.freeShipping} onChange={(e) => setFormData({...formData, freeShipping: e.target.checked})} style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontWeight: '500' }}>Free Shipping</span>
                  </label>
                </div>
              </div>

              {/* SECTION: Details & Features */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: 'var(--color-primary)', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Details & Content</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">Description *</label>
                    <textarea className="input" required rows="3" style={{ resize: 'vertical' }} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Write a compelling product description..."></textarea>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Key Features (One per line)</label>
                    <textarea className="input" rows="4" style={{ resize: 'vertical' }} value={formData.features} onChange={(e) => setFormData({...formData, features: e.target.value})} placeholder="Active Noise Cancellation&#10;60-Hour Battery Life&#10;Bluetooth 5.3"></textarea>
                  </div>
                </div>
              </div>

              {/* SECTION: Media & Variants */}
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '12px', color: 'var(--color-primary)', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }}>Media & Options</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label">Product Image</label>
                    <input type="file" className="input" accept="image/*" onChange={(e) => {
                      if(e.target.files && e.target.files[0]) {
                        setFormData({...formData, imageFile: e.target.files[0]});
                      }
                    }} style={{ padding: '8px' }} />
                    {formData.image && !formData.imageFile && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--color-primary)' }}>
                        Current image: <img src={formData.image} alt="preview" style={{width: '30px', height: '30px', objectFit: 'cover', verticalAlign: 'middle', marginLeft: '4px'}} />
                      </div>
                    )}
                  </div>
                  <div className="input-group">
                    <label className="input-label">Colors (Comma separated)</label>
                    <input className="input" value={formData.colorVariants} onChange={(e) => setFormData({...formData, colorVariants: e.target.value})} placeholder="Matte Black, Arctic White" />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Sizes (Comma separated)</label>
                    <input className="input" value={formData.sizeVariants} onChange={(e) => setFormData({...formData, sizeVariants: e.target.value})} placeholder="S, M, L, XL" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                <button type="button" className="btn btn-outline" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0 32px' }} disabled={loading}>
                  {loading ? 'Saving...' : (editingProduct ? 'Save Changes' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
