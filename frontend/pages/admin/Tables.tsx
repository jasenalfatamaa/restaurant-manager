import React, { useEffect, useState } from 'react';
    import { ApiService } from '../../services/api';
    import { Table } from '../../types';
    import { Printer, RefreshCw, Plus, Edit2, Trash2, X, Save, AlertTriangle, LogOut, Sparkles } from 'lucide-react';
    import { useAuth } from '../../context/AuthContext';
    
    const Tables: React.FC = () => {
      const { user } = useAuth();
      const [tables, setTables] = useState<Table[]>([]);
      const [selectedTableForPrint, setSelectedTableForPrint] = useState<Table | null>(null);
      
      // Modal State
      const [isModalOpen, setIsModalOpen] = useState(false);
      const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
      const [isClearModalOpen, setIsClearModalOpen] = useState(false); // NEW STATE FOR CLEAR MODAL

      const [editingTable, setEditingTable] = useState<Table | null>(null);
      const [tableToDelete, setTableToDelete] = useState<Table | null>(null);
      const [tableToClear, setTableToClear] = useState<number | null>(null); // NEW STATE FOR CLEAR TARGET

      // Form State
      const [tableCapacity, setTableCapacity] = useState(4);
      const [tableNumber, setTableNumber] = useState(0);

      useEffect(() => {
        loadData();
      }, []);

      const loadData = async () => setTables(await ApiService.getTables());
    
      const handleAddClick = () => {
        const nextNum = tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1;
        setTableNumber(nextNum);
        setTableCapacity(4);
        setEditingTable(null); // Null means adding new
        setIsModalOpen(true);
      };

      const handleEditClick = (e: React.MouseEvent, table: Table) => {
        e.stopPropagation(); // Prevent triggering card selection
        setEditingTable(table);
        setTableNumber(table.number);
        setTableCapacity(table.capacity);
        setIsModalOpen(true);
      };

      const handleDeleteClick = (e: React.MouseEvent, table: Table) => {
        e.stopPropagation();
        setTableToDelete(table);
        setIsDeleteConfirmOpen(true);
      };

      // Handler trigger Modal
      const handleClearTableClick = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        setTableToClear(id);
        setIsClearModalOpen(true);
      };

      // Action Confirm Clear
      const confirmClearTable = async () => {
        if (tableToClear !== null) {
            await ApiService.clearTable(tableToClear);
            setTableToClear(null);
            setIsClearModalOpen(false);
            loadData();
        }
      };

      const confirmDelete = async () => {
        if(tableToDelete) {
            await ApiService.deleteTable(tableToDelete.id);
            setTableToDelete(null);
            setIsDeleteConfirmOpen(false);
            if(selectedTableForPrint?.id === tableToDelete.id) setSelectedTableForPrint(null);
            loadData();
        }
      };

      const handleSave = async () => {
        if (editingTable) {
            // Update
            const updated: Table = { ...editingTable, number: tableNumber, capacity: tableCapacity };
            await ApiService.updateTable(updated);
        } else {
            // Create
            const newId = tables.length > 0 ? Math.max(...tables.map(t => t.id)) + 1 : 1;
            const newTable: Table = {
                id: newId,
                number: tableNumber,
                capacity: tableCapacity,
                status: 'AVAILABLE'
            };
            await ApiService.addTable(newTable);
        }
        setIsModalOpen(false);
        loadData();
      };

      // Just a simple browser print trigger for the specific element
      const handlePrint = () => {
        if(!selectedTableForPrint) return;
        window.print();
      };

      // Allow only manager and admin to manage tables
      const canManage = user?.role === 'manager' || user?.role === 'admin';
    
      return (
        <div className="w-full flex flex-col lg:flex-row gap-8 pb-10 min-h-full lg:pb-0 relative">
          {/* Table List */}
          <div className="flex-none lg:flex-1">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-3xl font-bold text-charcoal">Table Management</h2>
                {canManage && (
                    <button 
                        onClick={handleAddClick}
                        className="px-4 py-2 bg-forest text-white rounded-lg flex items-center gap-2 font-bold hover:bg-forest/90 transition-colors shadow-md"
                    >
                        <Plus size={18} /> 
                        <span className="hidden sm:inline">Add Table</span>
                        <span className="sm:hidden">Add</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.map(table => (
                <div 
                  key={table.id}
                  onClick={() => setSelectedTableForPrint(table)}
                  className={`
                    p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 relative overflow-hidden group
                    ${selectedTableForPrint?.id === table.id 
                      ? 'border-forest bg-forest/5' 
                      : 'border-stone-200 bg-white hover:border-forest/50'}
                  `}
                >
                  <div className="flex justify-between items-start">
                     <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Table</div>
                     {/* Edit/Delete Buttons (Only for Manager/Admin) */}
                     {canManage && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <button onClick={(e) => handleEditClick(e, table)} className="text-stone-400 hover:text-forest p-1 bg-white rounded-md shadow-sm">
                                <Edit2 size={14} />
                            </button>
                             <button onClick={(e) => handleDeleteClick(e, table)} className="text-stone-400 hover:text-terracotta p-1 bg-white rounded-md shadow-sm">
                                <Trash2 size={14} />
                            </button>
                        </div>
                     )}
                  </div>
                  
                  <div className="text-4xl font-serif font-bold text-forest">{table.number}</div>
                  
                  <div className="mt-4 flex justify-between items-end">
                    <span className="text-sm text-stone-400">{table.capacity} Seats</span>
                    <span className={`w-3 h-3 rounded-full ${table.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>

                  {/* Manual Clear Table Button (Only if Occupied) */}
                  {table.status === 'OCCUPIED' && (
                      <div className="mt-4 pt-4 border-t border-stone-100 flex justify-center">
                          <button 
                            onClick={(e) => handleClearTableClick(e, table.id)}
                            className="text-xs font-bold text-stone-500 hover:text-forest flex items-center gap-1 bg-stone-50 px-3 py-1.5 rounded-full hover:bg-white border border-stone-200 hover:border-forest transition-colors shadow-sm"
                          >
                             <LogOut size={12} /> Clear Table
                          </button>
                      </div>
                  )}
                  
                  {/* Hover Print Icon (If not managing) */}
                  {!canManage && (
                      <div className="absolute inset-0 bg-forest/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                        <Printer />
                      </div>
                  )}
                </div>
              ))}
            </div>
          </div>
    
          {/* Preview & Print Section */}
          <div className="w-full lg:w-96 bg-white p-6 rounded-xl border border-stone-200 shadow-lg flex flex-col items-center shrink-0 flex-1 lg:flex-none">
            <h3 className="font-serif text-xl font-bold text-charcoal mb-4">QR Generator</h3>
            
            {selectedTableForPrint ? (
              <>
                {/* Visual Printable Area */}
                <div id="printable-area" className="mb-6">
                  <div className="w-64 h-80 bg-[#F4F1DE] border-8 border-[#2D6A4F] rounded-lg p-4 flex flex-col items-center justify-between text-center relative shadow-inner">
                    {/* Decorative Corners */}
                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#BC4749]" />
                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#BC4749]" />
                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#BC4749]" />
                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#BC4749]" />
    
                    <div>
                      <h4 className="font-serif text-xl font-bold text-[#2D6A4F]">Rustic Roots</h4>
                      <p className="text-[10px] text-[#3D405B] tracking-widest uppercase">Scan to Order</p>
                    </div>
    
                    <div className="bg-white p-2 rounded shadow-sm">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=http://localhost:3000/%23/?table=${selectedTableForPrint.id}&color=2D6A4F`} 
                        alt="QR Code" 
                        className="w-32 h-32"
                      />
                    </div>
    
                    <div className="font-serif">
                      <span className="block text-xs text-[#BC4749] italic">Table Number</span>
                      <span className="text-3xl font-bold text-[#2D6A4F]">{selectedTableForPrint.number}</span>
                    </div>
                  </div>
                </div>
    
                <button 
                  onClick={handlePrint}
                  className="w-full py-3 bg-terracotta text-white font-bold rounded-lg shadow-lg hover:bg-terracotta/90 flex items-center justify-center gap-2"
                >
                  <Printer size={18} /> Print Card
                </button>
    
                {/* Simple CSS to ensure only the card prints if we were doing real window.print logic customization */}
                <style>{`
                  @media print {
                    body * { visibility: hidden; }
                    #printable-area, #printable-area * { visibility: visible; }
                    #printable-area { position: absolute; left: 0; top: 0; width: 100%; display: flex; justify-content: center; align-items: center; height: 100vh; }
                  }
                `}</style>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-stone-400 text-center p-8 border-2 border-dashed border-stone-200 rounded-lg w-full">
                <RefreshCw size={32} className="mb-2 opacity-50" />
                <p>Select a table to generate QR Card</p>
              </div>
            )}
          </div>

           {/* ADD/EDIT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-serif text-xl font-bold text-charcoal">{editingTable ? 'Edit Table' : 'Add New Table'}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600"><X size={20}/></button>
                        </div>
                        
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Table Number</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-forest"
                                    value={tableNumber}
                                    onChange={(e) => setTableNumber(parseInt(e.target.value) || 0)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Seat Capacity</label>
                                <input 
                                    type="number" 
                                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-forest"
                                    value={tableCapacity}
                                    onChange={(e) => setTableCapacity(parseInt(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-lg font-bold hover:bg-stone-200">Cancel</button>
                            <button onClick={handleSave} className="flex-1 py-2 bg-forest text-beige rounded-lg font-bold hover:bg-forest/90 flex items-center justify-center gap-2">
                                <Save size={16} /> Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRM MODAL */}
             {isDeleteConfirmOpen && tableToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in duration-200 text-center">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-charcoal mb-2">Delete Table {tableToDelete.number}?</h3>
                        <p className="text-stone-500 text-sm mb-6">Are you sure you want to delete this table? This action cannot be undone.</p>
                        
                        <div className="flex gap-3">
                            <button onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-lg font-bold hover:bg-stone-200">Cancel</button>
                            <button onClick={confirmDelete} className="flex-1 py-2 bg-terracotta text-white rounded-lg font-bold hover:bg-terracotta/90 flex items-center justify-center gap-2">
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CLEAR TABLE CONFIRM MODAL */}
            {isClearModalOpen && tableToClear && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in zoom-in duration-200 text-center">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles size={24} />
                        </div>
                        <h3 className="font-serif text-xl font-bold text-charcoal mb-2">Clear Table?</h3>
                        <p className="text-stone-500 text-sm mb-6">
                            Apakah meja ini sudah dibersihkan dan siap untuk customer selanjutnya?
                        </p>
                        
                        <div className="flex gap-3">
                            <button onClick={() => setIsClearModalOpen(false)} className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-lg font-bold hover:bg-stone-200">
                                Batal
                            </button>
                            <button onClick={confirmClearTable} className="flex-1 py-2 bg-forest text-white rounded-lg font-bold hover:bg-forest/90 flex items-center justify-center gap-2">
                                <RefreshCw size={16} /> Bersih
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
      );
    };
    
    export default Tables;