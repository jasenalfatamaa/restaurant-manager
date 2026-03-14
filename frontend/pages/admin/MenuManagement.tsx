import React, { useEffect, useState } from 'react';
import { ApiService } from '../../services/api';
import { Product, ModifierGroup, Modifier, Category } from '../../types';
import { Edit, Plus, Trash2, Save, X, Upload, Search, Filter, ArrowUp, ArrowDown } from 'lucide-react';

const MenuManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Search, Filter, Sort States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [prods, cats] = await Promise.all([
        ApiService.getProducts(),
        ApiService.getCategories()
    ]);
    setProducts(prods);
    setCategories(cats);
  };

  const handleEditClick = (product: Product) => {
    // Deep copy to avoid mutating state directly during edits
    setEditingProduct(JSON.parse(JSON.stringify(product)));
  };

  const handleCreateNew = () => {
      const newProduct: Product = {
          id: Date.now(),
          name: "New Product",
          description: "Description here",
          price: 0,
          category: categories[0]?.name || "Mains",
          image: "",
          modifierGroups: []
      };
      setEditingProduct(newProduct);
  }

  const handleSave = async () => {
    if (editingProduct) {
      await ApiService.updateProduct(editingProduct);
      setEditingProduct(null);
      loadData();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingProduct) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setEditingProduct({ ...editingProduct, image: reader.result as string });
        };
        reader.readAsDataURL(file);
    }
  };

  // --- Modifier Logic ---

  const addModifierGroup = () => {
    if (!editingProduct) return;
    const newGroup: ModifierGroup = {
      id: `group-${Date.now()}`,
      name: "New Option Group",
      minSelection: 0,
      maxSelection: 1,
      options: []
    };
    setEditingProduct({
      ...editingProduct,
      modifierGroups: [...(editingProduct.modifierGroups || []), newGroup]
    });
  };

  const removeModifierGroup = (groupId: string) => {
    if (!editingProduct) return;
    setEditingProduct({
        ...editingProduct,
        modifierGroups: editingProduct.modifierGroups?.filter(g => g.id !== groupId)
    });
  };

  const updateModifierGroup = (index: number, field: keyof ModifierGroup, value: any) => {
    if (!editingProduct || !editingProduct.modifierGroups) return;
    const newGroups = [...editingProduct.modifierGroups];
    newGroups[index] = { ...newGroups[index], [field]: value };
    setEditingProduct({ ...editingProduct, modifierGroups: newGroups });
  };

  const addOptionToGroup = (groupIndex: number) => {
      if (!editingProduct || !editingProduct.modifierGroups) return;
      const newGroups = [...editingProduct.modifierGroups];
      const newOption: Modifier = {
          id: `opt-${Date.now()}`,
          name: "New Option",
          price: 0
      };
      newGroups[groupIndex].options.push(newOption);
      setEditingProduct({ ...editingProduct, modifierGroups: newGroups });
  };

  const removeOptionFromGroup = (groupIndex: number, optionIndex: number) => {
    if (!editingProduct || !editingProduct.modifierGroups) return;
    const newGroups = [...editingProduct.modifierGroups];
    newGroups[groupIndex].options.splice(optionIndex, 1);
    setEditingProduct({ ...editingProduct, modifierGroups: newGroups });
  };

  const updateOption = (groupIndex: number, optionIndex: number, field: keyof Modifier, value: any) => {
    if (!editingProduct || !editingProduct.modifierGroups) return;
    const newGroups = [...editingProduct.modifierGroups];
    newGroups[groupIndex].options[optionIndex] = { 
        ...newGroups[groupIndex].options[optionIndex], 
        [field]: value 
    };
    setEditingProduct({ ...editingProduct, modifierGroups: newGroups });
  };

  // --- Filtering Logic ---
  const getProcessedProducts = () => {
    let filtered = [...products];

    // Search
    if (searchTerm) {
        const lowerTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(lowerTerm) ||
            p.description.toLowerCase().includes(lowerTerm)
        );
    }

    // Filter
    if (filterCategory !== 'All') {
        filtered = filtered.filter(p => p.category === filterCategory);
    }

    // Sort
    filtered.sort((a, b) => {
        let valA = a[sortBy];
        let valB = b[sortBy];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    return filtered;
  };

  const processedProducts = getProcessedProducts();

  return (
    <div className="pb-6 md:pb-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-serif text-3xl font-bold text-charcoal">Menu Management</h2>
          <p className="text-stone-500">Manage products, prices, and modifier options.</p>
        </div>
        <button 
            onClick={handleCreateNew}
            className="px-4 py-2 bg-forest text-white rounded-lg flex items-center gap-2 font-bold hover:bg-forest/90"
        >
          <Plus size={18} /> <span className="hidden md:inline">Add New Menu</span><span className="md:hidden">Add</span>
        </button>
      </div>

      {/* Main Table */}
      {!editingProduct ? (
        <>
            {/* Controls Bar: Search, Filter, Sort */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                 {/* Search */}
                 <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search by name or description..." 
                        className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-forest text-sm text-charcoal"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>

                 <div className="flex gap-3 w-full md:w-auto">
                     {/* Filter */}
                     <div className="relative flex-1 md:flex-none">
                         <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                         <select 
                            className="w-full md:w-48 pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-forest text-sm text-charcoal appearance-none cursor-pointer"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                         >
                            <option value="All">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                         </select>
                     </div>

                     {/* Sort */}
                     <div className="flex items-center bg-stone-50 border border-stone-200 rounded-lg p-1">
                         <select 
                            className="bg-transparent text-sm font-medium text-stone-600 outline-none px-2 cursor-pointer h-full"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                         >
                            <option value="name">Name</option>
                            <option value="price">Price</option>
                            <option value="category">Category</option>
                         </select>
                         <button 
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="p-1.5 hover:bg-stone-200 rounded text-stone-500 transition-colors"
                            title={sortOrder === 'asc' ? "Ascending" : "Descending"}
                         >
                            {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                         </button>
                    </div>
                 </div>
            </div>

            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden md:block bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-stone-500 text-xs uppercase tracking-wider font-bold">
                    <tr>
                      <th className="p-4">Product</th>
                      <th className="p-4">Category</th>
                      <th className="p-4">Price</th>
                      <th className="p-4">Modifiers</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {processedProducts.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="p-8 text-center text-stone-400 italic">
                                No products found matching your criteria.
                            </td>
                        </tr>
                    ) : (
                        processedProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                            <td className="p-4">
                            <div className="flex items-center gap-4">
                                <img src={product.image || 'https://via.placeholder.com/150'} alt="" className="w-12 h-12 rounded-lg object-cover bg-stone-200" />
                                <div>
                                <div className="font-bold text-charcoal">{product.name}</div>
                                <div className="text-xs text-stone-400 line-clamp-1 max-w-[200px]">{product.description}</div>
                                </div>
                            </div>
                            </td>
                            <td className="p-4">
                            <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs font-bold">
                                {product.category}
                            </span>
                            </td>
                            <td className="p-4 font-mono text-sm">
                            Rp {product.price.toLocaleString('id-ID')}
                            </td>
                            <td className="p-4">
                            {product.modifierGroups && product.modifierGroups.length > 0 ? (
                                <div className="flex gap-1 flex-wrap">
                                {product.modifierGroups.map(g => (
                                    <span key={g.id} className="text-[10px] border border-forest/30 text-forest px-1.5 py-0.5 rounded bg-forest/5">
                                    {g.name}
                                    </span>
                                ))}
                                </div>
                            ) : (
                                <span className="text-stone-400 text-xs italic">No modifiers</span>
                            )}
                            </td>
                            <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={() => handleEditClick(product)}
                                    className="p-2 text-stone-400 hover:text-forest hover:bg-stone-100 rounded-lg transition-colors" 
                                    title="Edit"
                                >
                                <Edit size={18} />
                                </button>
                                <button className="p-2 text-stone-400 hover:text-terracotta hover:bg-stone-100 rounded-lg transition-colors">
                                <Trash2 size={18} />
                                </button>
                            </div>
                            </td>
                        </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View (Visible on Mobile) */}
            <div className="md:hidden grid grid-cols-1 gap-4">
                {processedProducts.length === 0 ? (
                    <div className="p-8 text-center text-stone-400 italic bg-stone-50 rounded-lg border border-dashed border-stone-200">
                        No products found.
                    </div>
                ) : (
                    processedProducts.map(product => (
                        <div key={product.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex gap-4">
                            <img src={product.image || 'https://via.placeholder.com/150'} alt="" className="w-20 h-20 rounded-lg object-cover bg-stone-200 shrink-0" />
                            <div className="flex-1 flex flex-col">
                                <div className="flex justify-between items-start">
                                    <div className="font-bold text-charcoal">{product.name}</div>
                                    <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-bold">
                                        {product.category}
                                    </span>
                                </div>
                                <div className="text-xs text-stone-400 line-clamp-1 mb-2">{product.description}</div>
                                
                                <div className="mt-auto flex justify-between items-end">
                                    <div className="font-mono text-sm font-bold text-forest">
                                        Rp {product.price.toLocaleString('id-ID')}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => handleEditClick(product)}
                                            className="p-2 bg-stone-50 text-stone-500 hover:bg-forest/10 hover:text-forest rounded-lg"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button className="p-2 bg-stone-50 text-stone-500 hover:bg-terracotta/10 hover:text-terracotta rounded-lg">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </>
      ) : (
        /* EDIT FORM */
        <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden mb-24 md:mb-0">
            <div className="bg-forest text-beige p-4 flex justify-between items-center">
                <h3 className="font-serif text-xl font-bold">
                    {editingProduct.id ? 'Edit Product' : 'New Product'}
                </h3>
                <button onClick={() => setEditingProduct(null)} className="hover:bg-white/20 p-1 rounded">
                    <X size={24} />
                </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Col: Basic Info */}
                <div className="space-y-4">
                    <h4 className="font-bold text-charcoal border-b pb-2 mb-4">Basic Information</h4>
                    
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Product Name</label>
                        <input 
                            type="text" 
                            className="w-full p-2 bg-white text-charcoal border border-stone-300 rounded focus:border-forest outline-none shadow-sm"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Price (Rp)</label>
                            <input 
                                type="number" 
                                className="w-full p-2 bg-white text-charcoal border border-stone-300 rounded focus:border-forest outline-none shadow-sm"
                                value={editingProduct.price}
                                onChange={(e) => setEditingProduct({...editingProduct, price: parseInt(e.target.value) || 0})}
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Category</label>
                            <select 
                                className="w-full p-2 bg-white text-charcoal border border-stone-300 rounded focus:border-forest outline-none shadow-sm"
                                value={editingProduct.category}
                                onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Description</label>
                        <textarea 
                            className="w-full p-2 bg-white text-charcoal border border-stone-300 rounded focus:border-forest outline-none h-24 shadow-sm"
                            value={editingProduct.description}
                            onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                        />
                    </div>
                     
                    {/* Image Upload Replacement */}
                    <div>
                        <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Product Image</label>
                        <div className="flex items-start gap-4 p-2 border border-stone-200 rounded-lg bg-stone-50">
                            <div className="w-20 h-20 bg-white border border-stone-200 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                                {editingProduct.image ? (
                                    <img src={editingProduct.image} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-stone-300 flex flex-col items-center">
                                       <Upload size={20} />
                                       <span className="text-[10px] mt-1">No Img</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-forest file:text-beige hover:file:bg-forest/90 cursor-pointer"
                                />
                                <p className="text-[10px] text-stone-400 mt-2">
                                   Formats: JPG, PNG. Max size 2MB.<br/>
                                   Image will be stored as base64 for this demo.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: Modifiers */}
                <div className="space-y-4">
                     <div className="flex justify-between items-center border-b pb-2 mb-4">
                         <h4 className="font-bold text-charcoal">Modifiers & Options</h4>
                         <button 
                            onClick={addModifierGroup}
                            className="text-xs bg-forest text-beige px-2 py-1 rounded flex items-center gap-1 hover:bg-forest/90"
                         >
                             <Plus size={12} /> Add Group
                         </button>
                     </div>

                     <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                        {editingProduct.modifierGroups?.map((group, gIndex) => (
                            <div key={group.id} className="bg-stone-50 border border-stone-200 rounded-lg p-3">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1 mr-2">
                                        <input 
                                            type="text" 
                                            className="font-bold bg-white text-charcoal border border-stone-300 rounded px-2 py-1 w-full outline-none focus:border-forest text-sm shadow-sm"
                                            value={group.name}
                                            onChange={(e) => updateModifierGroup(gIndex, 'name', e.target.value)}
                                            placeholder="Group Name (e.g. Sugar)"
                                        />
                                        <div className="flex gap-2 mt-2">
                                            <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-stone-400">Min</span>
                                                <input 
                                                    type="number" className="w-12 p-1 text-xs bg-white text-charcoal border border-stone-300 rounded shadow-sm focus:border-forest outline-none"
                                                    value={group.minSelection}
                                                    onChange={(e) => updateModifierGroup(gIndex, 'minSelection', parseInt(e.target.value))}
                                                />
                                            </div>
                                             <div className="flex items-center gap-1">
                                                <span className="text-[10px] text-stone-400">Max</span>
                                                <input 
                                                    type="number" className="w-12 p-1 text-xs bg-white text-charcoal border border-stone-300 rounded shadow-sm focus:border-forest outline-none"
                                                    value={group.maxSelection}
                                                    onChange={(e) => updateModifierGroup(gIndex, 'maxSelection', parseInt(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={() => removeModifierGroup(group.id)} className="text-stone-400 hover:text-terracotta">
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Options List */}
                                <div className="space-y-2 ml-2 border-l-2 border-stone-200 pl-2">
                                    {group.options.map((option, oIndex) => (
                                        <div key={option.id} className="flex gap-2 items-center">
                                            <input 
                                                type="text" 
                                                className="flex-1 p-1 text-xs bg-white text-charcoal border border-stone-300 rounded shadow-sm focus:border-forest outline-none"
                                                value={option.name}
                                                onChange={(e) => updateOption(gIndex, oIndex, 'name', e.target.value)}
                                                placeholder="Option Name"
                                            />
                                            <div className="relative">
                                                <span className="absolute left-1 top-1 text-[10px] text-stone-400">Rp</span>
                                                <input 
                                                    type="number" 
                                                    className="w-20 p-1 pl-4 text-xs bg-white text-charcoal border border-stone-300 rounded shadow-sm focus:border-forest outline-none text-right"
                                                    value={option.price}
                                                    onChange={(e) => updateOption(gIndex, oIndex, 'price', parseInt(e.target.value))}
                                                />
                                            </div>
                                            <button onClick={() => removeOptionFromGroup(gIndex, oIndex)} className="text-stone-300 hover:text-terracotta">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        onClick={() => addOptionToGroup(gIndex)}
                                        className="text-xs text-forest hover:underline flex items-center gap-1 mt-2"
                                    >
                                        <Plus size={12} /> Add Option
                                    </button>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            </div>

             <div className="bg-stone-50 p-4 border-t border-stone-200 flex justify-end gap-3">
                <button 
                    onClick={() => setEditingProduct(null)}
                    className="px-6 py-2 rounded-lg text-stone-500 font-bold hover:bg-stone-200 transition"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    className="px-6 py-2 rounded-lg bg-forest text-beige font-bold shadow-lg hover:bg-forest/90 transition flex items-center gap-2"
                >
                    <Save size={18} /> Save Changes
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;