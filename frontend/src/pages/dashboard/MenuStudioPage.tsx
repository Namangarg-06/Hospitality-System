import React, { useState, useEffect, useRef } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Sparkles,
  Upload,
  QrCode,
  Edit2,
  Trash2,
  Check,
  X,
  AlertCircle,
  Eye,
  CheckCircle2,
  FileText,
  Search,
  ExternalLink,
  Download
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MenuCategory, MenuItem } from '../../types';

export const MenuStudioPage: React.FC = () => {
  const { workspace } = useAuth();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Form states
  const [itemForm, setItemForm] = useState({
    name: '',
    category_id: 0,
    price: 0,
    short_description: '',
    long_description: '',
    description_hi: '',
    description_hinglish: '',
    dietary_badges: ['veg'],
    allergens: [] as string[],
    spice_level: 'mild',
    is_chef_special: false,
    is_available: true,
    is_published: true,
  });

  const [newCatName, setNewCatName] = useState('');

  // AI Description Generator State
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiDishName, setAiDishName] = useState('');
  const [aiResult, setAiResult] = useState<any>(null);

  // PDF Upload & Verification Screen State
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [extractionPreview, setExtractionPreview] = useState<any>(null);
  const [approvedList, setApprovedList] = useState<any[]>([]);

  const qrRef = useRef<SVGSVGElement>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, menuItems] = await Promise.all([
        api.getCategories(),
        api.getMenuItems(),
      ]);
      setCategories(cats);
      setItems(menuItems);
      if (cats.length > 0 && itemForm.category_id === 0) {
        setItemForm((prev) => ({ ...prev, category_id: cats[0].id }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateItem = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      category_id: categories[0]?.id || 0,
      price: 350,
      short_description: '',
      long_description: '',
      description_hi: '',
      description_hinglish: '',
      dietary_badges: ['veg'],
      allergens: [],
      spice_level: 'mild',
      is_chef_special: false,
      is_available: true,
      is_published: true,
    });
    setShowItemModal(true);
  };

  const handleOpenEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      category_id: item.category_id,
      price: item.price,
      short_description: item.short_description || '',
      long_description: item.long_description || '',
      description_hi: item.description_hi || '',
      description_hinglish: item.description_hinglish || '',
      dietary_badges: item.dietary_badges || ['veg'],
      allergens: item.allergens || [],
      spice_level: item.spice_level || 'mild',
      is_chef_special: item.is_chef_special,
      is_available: item.is_available,
      is_published: item.is_published,
    });
    setShowItemModal(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateMenuItem(editingItem.id, itemForm);
      } else {
        await api.createMenuItem(itemForm);
      }
      setShowItemModal(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save menu dish');
    }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to remove this dish?')) return;
    try {
      await api.deleteMenuItem(id);
      loadData();
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await api.updateMenuItem(item.id, { is_available: !item.is_available });
      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, is_available: !i.is_available } : i))
      );
    } catch (err) {
      alert('Failed to toggle status');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.createCategory({ name: newCatName.trim(), display_order: categories.length + 1 });
      setNewCatName('');
      setShowCategoryModal(false);
      loadData();
    } catch (err) {
      alert('Failed to create category');
    }
  };

  const handleGenerateAiDescription = async () => {
    if (!aiDishName.trim()) return;
    setAiGenerating(true);
    try {
      const res = await api.generateAiDescription({ dish_name: aiDishName });
      setAiResult(res);
    } catch (err) {
      alert('AI Generation error');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleApplyAiDescriptionToForm = () => {
    if (!aiResult) return;
    setItemForm((prev) => ({
      ...prev,
      name: aiDishName || prev.name,
      short_description: aiResult.short_description,
      long_description: aiResult.long_description,
      description_hi: aiResult.description_hi,
      description_hinglish: aiResult.description_hinglish,
      allergens: aiResult.suggested_allergens || [],
    }));
    setShowAiModal(false);
    setShowItemModal(true);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPdf(true);
    try {
      const res = await api.uploadMenuPdf(file);
      setExtractionPreview(res);
      setApprovedList(res.extracted_dishes);
    } catch (err: any) {
      alert(err.message || 'Error processing menu PDF');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleApproveImport = async () => {
    if (!approvedList.length) return;
    try {
      await api.approveImportedDishes(approvedList);
      alert(`Successfully approved and added ${approvedList.length} items to your trusted menu!`);
      setShowPdfModal(false);
      setExtractionPreview(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Import failed');
    }
  };

  const publicMenuUrl = `${window.location.origin}/m/${workspace?.slug || 'the-royal-saffron'}`;

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
            AI Menu Studio
          </h2>
          <p className="text-sm text-[#737B73] mt-0.5">
            Curate dish portfolios, generate multilingual descriptions, and publish live QR menus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-[#E7E4DC] text-[#173D32] hover:bg-[#FAF6ED] transition-colors flex items-center shadow-subtle"
          >
            <QrCode className="w-3.5 h-3.5 mr-1.5 text-[#C6A66A]" />
            Restaurant QR Code
          </button>

          <button
            onClick={() => setShowPdfModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-[#E7E4DC] text-[#173D32] hover:bg-[#FAF6ED] transition-colors flex items-center shadow-subtle"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5" />
            Upload PDF Menu
          </button>

          <button
            onClick={() => {
              setAiDishName('');
              setAiResult(null);
              setShowAiModal(true);
            }}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#FAF6ED] border border-[#DCB980] text-[#173D32] hover:bg-[#F4ECD8] transition-colors flex items-center shadow-subtle"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#C6A66A]" />
            AI Description Studio
          </button>

          <button
            onClick={handleOpenCreateItem}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#173D32] hover:bg-[#102C25] text-white flex items-center shadow-luxury transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Dish
          </button>
        </div>
      </div>

      {/* Categories Bar & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#E7E4DC] shadow-subtle">
        
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 sm:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#173D32] text-white shadow-sm'
                : 'bg-[#F8F6F0] text-[#737B73] hover:text-[#202722]'
            }`}
          >
            All Items ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter((i) => i.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#173D32] text-white shadow-sm'
                    : 'bg-[#F8F6F0] text-[#737B73] hover:text-[#202722]'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-2.5 py-1.5 text-xs text-[#173D32] hover:underline font-semibold whitespace-nowrap"
          >
            + Add Category
          </button>
        </div>

        {/* Search */}
        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-[#737B73] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dish by name..."
            className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-lg border border-[#E7E4DC] bg-[#F8F6F0] focus:outline-none focus:ring-1 focus:ring-[#173D32]"
          />
        </div>

      </div>

      {/* DISHES GRID */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((dish) => (
            <div
              key={dish.id}
              className="card-luxury rounded-2xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-44 bg-[#E7E4DC]">
                  {dish.image_url ? (
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#FAF6ED] text-[#737B73]">
                      <UtensilsCrossed className="w-8 h-8 opacity-40 text-[#C6A66A]" />
                    </div>
                  )}

                  {/* Dietary Badge */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {dish.dietary_badges?.map((badge) => (
                      <span
                        key={badge}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded shadow-sm ${
                          badge === 'veg'
                            ? 'bg-emerald-600 text-white'
                            : badge === 'vegan'
                            ? 'bg-green-700 text-white'
                            : 'bg-rose-700 text-white'
                        }`}
                      >
                        {badge.toUpperCase()}
                      </span>
                    ))}
                    {dish.is_chef_special && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#C6A66A] text-[#102C25] shadow-sm flex items-center">
                        <Sparkles className="w-2.5 h-2.5 mr-1" /> SPECIAL
                      </span>
                    )}
                  </div>

                  {/* Price Tag */}
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-[#102C25]/90 backdrop-blur-sm text-white font-serif font-bold text-sm shadow-luxury">
                    ₹{dish.price}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="font-serif text-base font-bold text-[#173D32]">
                      {dish.name}
                    </h3>
                  </div>

                  <p className="text-xs text-[#737B73] mt-2 line-clamp-2 leading-relaxed">
                    {dish.short_description || dish.long_description || 'Artisanal dish prepared with authentic spices.'}
                  </p>

                  {/* Multilingual Preview pill */}
                  {dish.description_hi && (
                    <p className="text-[11px] text-[#8C6F3B] mt-2 font-serif italic line-clamp-1">
                      {dish.description_hi}
                    </p>
                  )}

                  {/* Allergens */}
                  {dish.allergens && dish.allergens.length > 0 && (
                    <div className="mt-3 flex items-center space-x-1.5 text-[10px] text-[#737B73]">
                      <span className="font-semibold uppercase tracking-wider text-[#202722]">Allergens:</span>
                      <span>{dish.allergens.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Controls */}
              <div className="p-4 border-t border-[#E7E4DC] bg-[#FAF6ED]/30 flex items-center justify-between">
                <button
                  onClick={() => handleToggleAvailability(dish)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                    dish.is_available
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {dish.is_available ? 'Active in Menu' : 'Sold Out'}
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditItem(dish)}
                    title="Edit Dish"
                    className="p-1.5 rounded text-[#737B73] hover:text-[#173D32] hover:bg-[#EFECE2]"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteItem(dish.id)}
                    title="Delete Dish"
                    className="p-1.5 rounded text-[#737B73] hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl bg-white border border-[#E7E4DC]">
          <UtensilsCrossed className="w-10 h-10 text-[#C6A66A] mx-auto mb-3 opacity-60" />
          <h3 className="font-serif text-lg font-bold text-[#173D32]">No dishes matching your criteria</h3>
          <p className="text-xs text-[#737B73] mt-1">Try resetting the category filter or add a new culinary creation.</p>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT DISH */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-5 border border-[#E7E4DC] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-4">
              <h3 className="font-serif text-lg font-bold text-[#173D32]">
                {editingItem ? 'Edit Menu Dish' : 'Create New Menu Dish'}
              </h3>
              <button onClick={() => setShowItemModal(false)} className="text-[#737B73] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                    Dish Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={itemForm.name}
                    onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                    placeholder="e.g. Kashmiri Dum Aloo"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC] focus:outline-none focus:ring-1 focus:ring-[#173D32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                    Category *
                  </label>
                  <select
                    value={itemForm.category_id}
                    onChange={(e) => setItemForm({ ...itemForm, category_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC] focus:outline-none focus:ring-1 focus:ring-[#173D32]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                    Price (INR ₹) *
                  </label>
                  <input
                    type="number"
                    step="5"
                    required
                    value={itemForm.price}
                    onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC] focus:outline-none focus:ring-1 focus:ring-[#173D32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                    Dietary Badge
                  </label>
                  <select
                    value={itemForm.dietary_badges[0] || 'veg'}
                    onChange={(e) => setItemForm({ ...itemForm, dietary_badges: [e.target.value] })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC] focus:outline-none focus:ring-1 focus:ring-[#173D32]"
                  >
                    <option value="veg">Vegetarian (Pure Veg)</option>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="jain">Jain Friendly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                  Short Description (English)
                </label>
                <textarea
                  rows={2}
                  value={itemForm.short_description}
                  onChange={(e) => setItemForm({ ...itemForm, short_description: e.target.value })}
                  placeholder="One sentence sensory teaser..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC] focus:outline-none focus:ring-1 focus:ring-[#173D32]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                    Hindi Description (हिंदी)
                  </label>
                  <input
                    type="text"
                    value={itemForm.description_hi}
                    onChange={(e) => setItemForm({ ...itemForm, description_hi: e.target.value })}
                    placeholder="कश्मीरी मसालों में तैयार..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC] focus:outline-none focus:ring-1 focus:ring-[#173D32]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-[#202722] mb-1">
                    Hinglish Description
                  </label>
                  <input
                    type="text"
                    value={itemForm.description_hinglish}
                    onChange={(e) => setItemForm({ ...itemForm, description_hinglish: e.target.value })}
                    placeholder="Spices ke saath slow-cook kiya hua..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC] focus:outline-none focus:ring-1 focus:ring-[#173D32]"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-2">
                <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.is_chef_special}
                    onChange={(e) => setItemForm({ ...itemForm, is_chef_special: e.target.checked })}
                    className="rounded text-[#173D32] focus:ring-[#173D32]"
                  />
                  <span>Mark as Chef Special</span>
                </label>

                <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.is_available}
                    onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                    className="rounded text-[#173D32] focus:ring-[#173D32]"
                  />
                  <span>Currently Available</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E7E4DC] flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-[#E7E4DC] text-[#737B73] hover:bg-[#F8F6F0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-lg bg-[#173D32] hover:bg-[#102C25] text-white shadow-luxury"
                >
                  {editingItem ? 'Save Changes' : 'Publish Dish to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD CATEGORY */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-[#E7E4DC] shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-[#173D32]">Add Menu Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Royal Biryanis"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[#E7E4DC] focus:outline-none focus:ring-1 focus:ring-[#173D32]"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-3 py-1.5 text-xs rounded border border-[#E7E4DC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded bg-[#173D32] text-white font-semibold"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: AI DESCRIPTION STUDIO */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-[#E7E4DC] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-[#C6A66A]" />
                <h3 className="font-serif text-lg font-bold text-[#173D32]">AI Menu Copywriter</h3>
              </div>
              <button onClick={() => setShowAiModal(false)} className="text-[#737B73]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#737B73]">
              Generate captivating short, long, Hindi, and Hinglish descriptions grounded in authentic culinary traditions.
            </p>

            <div className="flex space-x-2">
              <input
                type="text"
                value={aiDishName}
                onChange={(e) => setAiDishName(e.target.value)}
                placeholder="Enter dish name (e.g. Galouti Kebab, Shahi Tukda)..."
                className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#E7E4DC] focus:outline-none focus:ring-1 focus:ring-[#173D32]"
              />
              <button
                onClick={handleGenerateAiDescription}
                disabled={aiGenerating || !aiDishName.trim()}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#173D32] text-white hover:bg-[#102C25] disabled:opacity-50 shrink-0"
              >
                {aiGenerating ? 'Generating...' : 'Generate Copy'}
              </button>
            </div>

            {aiResult && (
              <div className="mt-4 p-4 rounded-xl bg-[#FAF6ED] border border-[#DCB980] space-y-3 text-xs">
                <div>
                  <span className="font-bold text-[#173D32] block">Short English:</span>
                  <p className="text-[#202722] mt-0.5">{aiResult.short_description}</p>
                </div>
                <div>
                  <span className="font-bold text-[#173D32] block">Hindi (हिंदी):</span>
                  <p className="text-[#8C6F3B] mt-0.5 font-serif">{aiResult.description_hi}</p>
                </div>
                <div>
                  <span className="font-bold text-[#173D32] block">Hinglish Blend:</span>
                  <p className="text-[#202722] mt-0.5">{aiResult.description_hinglish}</p>
                </div>

                <div className="pt-2 border-t border-[#DCB980] flex justify-end">
                  <button
                    onClick={handleApplyAiDescriptionToForm}
                    className="px-4 py-2 rounded-lg bg-[#173D32] text-white font-semibold flex items-center"
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    Review & Apply to Dish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 4: PDF UPLOAD & VERIFICATION REVIEW SCREEN */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 border border-[#E7E4DC] shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E7E4DC] pb-3">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-[#173D32]" />
                <h3 className="font-serif text-lg font-bold text-[#173D32]">PDF Menu Parser & Verification</h3>
              </div>
              <button onClick={() => setShowPdfModal(false)} className="text-[#737B73]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!extractionPreview ? (
              <div className="p-8 text-center border-2 border-dashed border-[#E7E4DC] rounded-xl hover:border-[#C6A66A] transition-colors">
                <Upload className="w-10 h-10 text-[#C6A66A] mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-[#173D32]">Select Menu PDF</h4>
                <p className="text-xs text-[#737B73] mt-1 mb-4">
                  PyMuPDF will parse items and prices. You will have a review screen to verify everything before importing.
                </p>
                <label className="inline-flex items-center px-4 py-2 rounded-lg bg-[#173D32] text-white text-xs font-semibold cursor-pointer hover:bg-[#102C25]">
                  <span>{uploadingPdf ? 'Parsing with PyMuPDF...' : 'Choose PDF File'}</span>
                  <input
                    type="file"
                    accept=".pdf"
                    disabled={uploadingPdf}
                    onChange={handlePdfUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-[#E4ECE7] text-[#173D32] text-xs flex items-center justify-between">
                  <span>Found {approvedList.length} candidate menu items for human verification.</span>
                  <span className="font-semibold text-emerald-800">PyMuPDF Parsed</span>
                </div>

                <div className="max-h-72 overflow-y-auto border border-[#E7E4DC] rounded-xl divide-y divide-[#E7E4DC]">
                  {approvedList.map((cand, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-[#173D32]">{cand.name}</span>
                        <span className="text-[#737B73] ml-2 font-mono">[{cand.category}]</span>
                        <p className="text-[11px] text-[#737B73] mt-0.5">{cand.description}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-[#173D32]">₹{cand.price}</span>
                        <button
                          onClick={() => setApprovedList((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-red-600 hover:text-red-800"
                          title="Remove from import"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-between items-center">
                  <button
                    onClick={() => setExtractionPreview(null)}
                    className="text-xs text-[#737B73] hover:underline"
                  >
                    Upload different file
                  </button>
                  <button
                    onClick={handleApproveImport}
                    className="px-5 py-2.5 rounded-lg bg-[#173D32] text-white text-xs font-semibold flex items-center shadow-luxury"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Approve & Import {approvedList.length} Dishes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 5: RESTAURANT QR CODE GENERATOR & DOWNLOAD */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-5 border border-[#E7E4DC] shadow-2xl">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold text-[#173D32]">
                Customer QR Menu
              </h3>
              <button onClick={() => setShowQrModal(false)} className="text-[#737B73]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#737B73]">
              Place this QR code on dining tables, counter stands, or door displays.
            </p>

            <div className="p-6 bg-[#FAF6ED] rounded-xl border border-[#DCB980] flex justify-center shadow-inner">
              <QRCodeSVG
                ref={qrRef}
                value={publicMenuUrl}
                size={200}
                fgColor="#173D32"
                bgColor="#FAF6ED"
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="text-xs text-[#173D32] font-mono break-all bg-[#F8F6F0] p-2 rounded">
              {publicMenuUrl}
            </div>

            <div className="flex space-x-2 pt-2">
              <a
                href={publicMenuUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-lg border border-[#E7E4DC] text-xs font-semibold text-[#173D32] hover:bg-[#F8F6F0] flex items-center justify-center"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1" /> Test Link
              </a>
              <button
                onClick={() => {
                  alert(`QR Code resolves to stable route: ${publicMenuUrl}`);
                }}
                className="flex-1 py-2 px-3 rounded-lg bg-[#173D32] text-xs font-semibold text-white hover:bg-[#102C25] flex items-center justify-center"
              >
                <Download className="w-3.5 h-3.5 mr-1" /> Verified
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
