import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ApiService } from '../../services/api';
import { User, Category, Role, LocationConfig } from '../../types';
import { Trash2, Plus, Save, RotateCcw, UserPlus, Layers, X, MapPin, Search, Loader2, Crosshair, Edit2, Ban } from 'lucide-react';
import MapComponent from '../../src/components/map/MapComponent';

const Settings: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'USERS' | 'LOCATION'>('CATEGORIES');
  
  // Data States
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locationConfig, setLocationConfig] = useState<LocationConfig | null>(null);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  
  // Edit States
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // Map Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Load Data
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    if (activeTab === 'USERS' && currentUser?.role === 'manager') {
      setUsers(await ApiService.getUsers());
    } else if (activeTab === 'LOCATION' && currentUser?.role === 'manager') {
      const config = await ApiService.getLocationConfig();
      setLocationConfig(config);
      setIsEditingLocation(false);
    } else {
      setCategories(await ApiService.getCategories());
    }
  };

  const handleSearchLocation = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!searchQuery) return;
      setIsSearching(true);

      try {
          // Use Nominatim OpenStreetMap API for geocoding
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
          const data = await response.json();

          if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lon = parseFloat(data[0].lon);

              if (locationConfig) {
                  setLocationConfig({ ...locationConfig, latitude: lat, longitude: lon });
              }
          } else {
              alert("Location not found. Please try a different query.");
          }
      } catch (err) {
          console.error(err);
          alert("Error searching location.");
      } finally {
          setIsSearching(false);
      }
  };

  // --- Handlers ---

  const handleSaveUser = async () => {
    if (editingUser && editingUser.username && editingUser.role) {
      await ApiService.upsertUser(editingUser as User);
      setEditingUser(null);
      loadData();
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      await ApiService.deleteUser(id);
      loadData();
    }
  };

  const handleSaveCategory = async () => {
    if (editingCategory && editingCategory.name) {
      await ApiService.upsertCategory(editingCategory as Category);
      setEditingCategory(null);
      loadData();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Delete this category? Products using it might be affected.')) {
      await ApiService.deleteCategory(id);
      loadData();
    }
  };

  const handleSaveLocation = async () => {
    if (locationConfig) {
      await ApiService.updateLocationConfig(locationConfig);
      setIsEditingLocation(false);
      alert("Location settings updated successfully.");
    }
  };

  const handleCancelLocation = () => {
      loadData(); // Revert changes
      setIsEditingLocation(false);
  }

  const handleUseCurrentLocation = () => {
      if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition((pos) => {
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              if (locationConfig) {
                  setLocationConfig({
                      ...locationConfig,
                      latitude: lat,
                      longitude: lng
                  });
              }
          }, (err) => {
              alert("Error getting location: " + err.message);
          });
      } else {
          alert("Geolocation not supported");
      }
  }

  const resetPassword = (u: User) => {
      setEditingUser({ ...u, password: '' });
  }

  return (
    <div className="h-full flex flex-col">
      <h2 className="font-serif text-3xl font-bold text-charcoal mb-2">Settings</h2>
      <p className="text-stone-500 mb-6">Manage application configurations and access.</p>

      {/* TABS */}
      <div className="flex gap-4 border-b border-stone-200 mb-6 overflow-x-auto shrink-0">
        <button
          onClick={() => setActiveTab('CATEGORIES')}
          className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'CATEGORIES' ? 'text-forest border-b-2 border-forest' : 'text-stone-400 hover:text-stone-600'}`}
        >
          <Layers size={18} /> Menu Categories
        </button>
        {currentUser?.role === 'manager' && (
          <>
            <button
              onClick={() => setActiveTab('USERS')}
              className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'USERS' ? 'text-forest border-b-2 border-forest' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <UserPlus size={18} /> User Management
            </button>
            <button
              onClick={() => setActiveTab('LOCATION')}
              className={`pb-3 px-2 font-bold text-sm flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'LOCATION' ? 'text-forest border-b-2 border-forest' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <MapPin size={18} /> Location
            </button>
          </>
        )}
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* --- CATEGORIES TAB --- */}
        {activeTab === 'CATEGORIES' && (
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 flex flex-col h-full max-w-3xl overflow-hidden mb-24 md:mb-0">
             <div className="p-6 pb-2 shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-charcoal">All Categories</h3>
                    <button 
                    onClick={() => setEditingCategory({ name: '' })}
                    className="bg-forest text-beige px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-forest/90"
                    >
                        <Plus size={14} /> Add New
                    </button>
                </div>

                {editingCategory && (
                    <div className="bg-stone-50 p-4 rounded-lg mb-4 border border-stone-200 flex gap-2 items-center">
                        <input 
                            type="text" 
                            placeholder="Category Name" 
                            className="flex-1 p-2 bg-white text-charcoal border border-stone-300 rounded focus:border-forest outline-none text-sm shadow-sm"
                            value={editingCategory.name || ''}
                            onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                        />
                        <button onClick={handleSaveCategory} className="p-2 bg-forest text-white rounded hover:bg-forest/90"><Save size={16}/></button>
                        <button onClick={() => setEditingCategory(null)} className="p-2 bg-stone-200 text-stone-600 rounded hover:bg-stone-300"><X size={16}/></button>
                    </div>
                )}
             </div>

             <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-2">
                 {categories.map(cat => (
                     <div key={cat.id} className="flex justify-between items-center p-3 bg-white border border-stone-100 rounded hover:bg-stone-50">
                         <span className="font-medium text-charcoal">{cat.name}</span>
                         <div className="flex gap-2">
                            <button 
                                onClick={() => setEditingCategory(cat)}
                                className="text-xs text-forest hover:underline"
                            >Edit</button>
                            <button 
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="text-stone-400 hover:text-terracotta"
                            ><Trash2 size={16}/></button>
                         </div>
                     </div>
                 ))}
             </div>
          </div>
        )}

        {/* --- USERS TAB --- */}
        {activeTab === 'USERS' && (
             <div className="bg-white rounded-xl shadow-sm border border-stone-200 flex flex-col h-full overflow-hidden mb-24 md:mb-0">
                <div className="p-6 pb-2 shrink-0">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-charcoal">System Users</h3>
                        <button 
                        onClick={() => setEditingUser({ role: 'cashier', username: '', name: '', password: '' })}
                        className="bg-forest text-beige px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1 hover:bg-forest/90"
                        >
                            <Plus size={16} /> Add User
                        </button>
                    </div>

                    {/* Edit/Create Form */}
                    {editingUser && (
                        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 mb-6 relative">
                            <button 
                                onClick={() => setEditingUser(null)}
                                className="absolute top-2 right-2 text-stone-400 hover:text-stone-600"
                            >
                                <X size={18} />
                            </button>
                            <h4 className="font-bold text-sm mb-3 uppercase text-forest">{editingUser.id ? 'Edit User' : 'New User'}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 mb-1">Full Name</label>
                                    <input type="text" className="w-full p-2 bg-white text-charcoal border border-stone-300 rounded focus:border-forest outline-none shadow-sm" 
                                        value={editingUser.name || ''} onChange={e => setEditingUser({...editingUser, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 mb-1">Username</label>
                                    <input type="text" className="w-full p-2 bg-white text-charcoal border border-stone-300 rounded focus:border-forest outline-none shadow-sm" 
                                        value={editingUser.username || ''} onChange={e => setEditingUser({...editingUser, username: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 mb-1">Role</label>
                                    <select className="w-full p-2 bg-white text-charcoal border border-stone-300 rounded focus:border-forest outline-none shadow-sm"
                                        value={editingUser.role} onChange={e => setEditingUser({...editingUser, role: e.target.value as Role})}
                                    >
                                        <option value="manager">Manager</option>
                                        <option value="admin">Admin</option>
                                        <option value="cashier">Cashier</option>
                                        <option value="kitchen">Kitchen</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-stone-500 mb-1">Password {editingUser.id && '(Leave empty to keep current)'}</label>
                                    <input type="password" className="w-full p-2 bg-white text-charcoal border border-stone-300 rounded focus:border-forest outline-none shadow-sm" 
                                        value={editingUser.password || ''} onChange={e => setEditingUser({...editingUser, password: e.target.value})} placeholder={editingUser.id ? '******' : 'Required'} />
                                </div>
                            </div>
                            <div className="mt-4 text-right">
                                <button onClick={handleSaveUser} className="bg-forest text-beige px-4 py-2 rounded font-bold hover:bg-forest/90">Save User</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-stone-100 text-stone-500 uppercase font-bold text-xs">
                                <tr>
                                    <th className="p-3 rounded-tl-lg">Name</th>
                                    <th className="p-3">Username</th>
                                    <th className="p-3">Role</th>
                                    <th className="p-3 rounded-tr-lg text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-stone-50">
                                        <td className="p-3 font-medium">{u.name}</td>
                                        <td className="p-3 font-mono text-stone-600">{u.username}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                                ${u.role === 'manager' ? 'bg-purple-100 text-purple-700' : 
                                                u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                                                u.role === 'kitchen' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}
                                            `}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-3 text-right flex justify-end gap-2">
                                            <button onClick={() => resetPassword(u)} className="p-1.5 text-stone-400 hover:text-forest" title="Edit/Reset Pass">
                                                <RotateCcw size={16} />
                                            </button>
                                            <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-stone-400 hover:text-terracotta" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3 pb-4">
                        {users.map(u => (
                            <div key={u.id} className="bg-white border border-stone-200 rounded-xl p-4 flex justify-between items-center shadow-sm">
                                <div>
                                    <div className="font-bold text-charcoal">{u.name}</div>
                                    <div className="text-xs text-stone-500 font-mono mb-2">@{u.username}</div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase
                                        ${u.role === 'manager' ? 'bg-purple-100 text-purple-700' : 
                                        u.role === 'admin' ? 'bg-blue-100 text-blue-700' :
                                        u.role === 'kitchen' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}
                                    `}>
                                        {u.role}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => resetPassword(u)} 
                                        className="p-2 bg-stone-50 text-stone-500 hover:text-forest rounded-lg" 
                                        title="Edit/Reset Pass"
                                    >
                                        <RotateCcw size={18} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteUser(u.id)} 
                                        className="p-2 bg-stone-50 text-stone-500 hover:text-terracotta rounded-lg" 
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        )}

        {/* --- LOCATION SETTINGS TAB --- */}
        {activeTab === 'LOCATION' && locationConfig && (
           <div className="bg-white rounded-xl shadow-sm border border-stone-200 flex flex-col h-full overflow-hidden mb-24 md:mb-0">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                        <h3 className="font-bold text-charcoal flex items-center gap-2">
                            <MapPin className="text-forest" size={20} />
                            Geofencing Map
                        </h3>
                        <p className="text-sm text-stone-500">
                        {isEditingLocation 
                            ? "Edit Mode: Click map to set center or use search." 
                            : "View Mode: Click Edit to modify location settings."}
                        </p>
                    </div>
                    
                    {/* Active Toggle */}
                    <div className={`flex items-center gap-3 px-3 py-2 rounded-lg border border-stone-200 w-auto ml-auto ${!isEditingLocation ? 'bg-stone-100 opacity-70' : 'bg-stone-50'}`}>
                        <label className={`relative inline-flex items-center ${isEditingLocation ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                        <input 
                            type="checkbox" 
                            checked={locationConfig.isActive} 
                            onChange={(e) => setLocationConfig({...locationConfig, isActive: e.target.checked})}
                            className="sr-only peer"
                            disabled={!isEditingLocation}
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-forest"></div>
                        </label>
                        <span className={`text-sm font-bold ${locationConfig.isActive ? 'text-forest' : 'text-stone-400'}`}>
                            {locationConfig.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                </div>

                {/* Controls Row */}
                <div className="flex flex-col md:flex-row gap-4 mb-4 z-10">
                    <form onSubmit={handleSearchLocation} className="flex-1 relative">
                        <input 
                            type="text" 
                            placeholder="Search address..." 
                            className={`w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-lg shadow-sm focus:border-forest outline-none text-charcoal ${!isEditingLocation ? 'bg-stone-100 text-stone-400' : ''}`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={!isEditingLocation}
                        />
                        <Search className="absolute left-3 top-3 text-stone-400" size={18} />
                        <button 
                            type="submit"
                            className="absolute right-2 top-2 p-1 bg-stone-100 rounded hover:bg-stone-200 text-stone-600"
                            disabled={isSearching || !isEditingLocation}
                        >
                            {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                        </button>
                    </form>

                    {/* Radius Input & Button Group */}
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-500 uppercase z-10">Radius</span>
                            <input 
                                type="number" 
                                className={`pl-16 pr-4 py-2.5 bg-white border border-stone-300 rounded-lg shadow-sm focus:border-forest outline-none text-charcoal w-full text-right font-bold ${!isEditingLocation ? 'bg-stone-100 text-stone-500' : ''}`}
                                value={locationConfig.radiusMeters}
                                onChange={(e) => setLocationConfig({...locationConfig, radiusMeters: parseInt(e.target.value) || 0})}
                                disabled={!isEditingLocation}
                            />
                        </div>

                        <button 
                            onClick={handleUseCurrentLocation}
                            className={`w-12 flex-none rounded-lg border border-stone-300 flex items-center justify-center ${isEditingLocation ? 'bg-stone-100 text-stone-600 hover:bg-stone-200' : 'bg-stone-100 text-stone-400 cursor-not-allowed'}`}
                            title="Use My Current Location"
                            disabled={!isEditingLocation}
                        >
                            <Crosshair size={20} />
                        </button>
                    </div>
                </div>

                {/* MAP CONTAINER */}
                <div className="relative bg-stone-100 rounded-xl border border-stone-300 overflow-hidden min-h-[400px] md:min-h-[500px] flex-1">
                    <MapComponent 
                        latitude={locationConfig.latitude}
                        longitude={locationConfig.longitude}
                        radius={locationConfig.radiusMeters}
                        isEditing={isEditingLocation}
                        onLocationChange={(lat, lng) => setLocationConfig({...locationConfig, latitude: lat, longitude: lng})}
                    />
                    
                    {/* Map Overlay Info */}
                    <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-md border border-stone-200 text-xs">
                        <div className="font-bold text-charcoal">Selected Coordinates</div>
                        <div className="text-stone-600 font-mono">
                            {locationConfig.latitude.toFixed(6)}, {locationConfig.longitude.toFixed(6)}
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-stone-100 pb-12">
                    {!isEditingLocation ? (
                        <button 
                            onClick={() => setIsEditingLocation(true)}
                            className="px-6 py-3 bg-forest text-beige rounded-xl font-bold hover:bg-forest/90 shadow-lg flex items-center gap-2"
                        >
                            <Edit2 size={18} /> Edit Configuration
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={handleCancelLocation}
                                className="px-6 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 flex items-center gap-2"
                            >
                                <Ban size={18} /> Cancel
                            </button>
                            <button 
                                onClick={handleSaveLocation}
                                className="px-6 py-3 bg-forest text-beige rounded-xl font-bold hover:bg-forest/90 shadow-lg flex items-center gap-2"
                            >
                                <Save size={18} /> Save Changes
                            </button>
                        </>
                    )}
                </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default Settings;