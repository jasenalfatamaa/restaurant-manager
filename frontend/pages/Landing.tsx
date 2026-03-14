import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Utensils, Users, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Landing: React.FC = () => {
    const navigate = useNavigate();
    const [selectedTable, setSelectedTable] = useState<number | null>(null);

    const tables = Array.from({ length: 8 }, (_, i) => i + 1);

    const handleEnter = () => {
        if (selectedTable) {
            navigate(`/welcome?table=${selectedTable}`);
        }
    };

    return (
        <div className="min-h-screen bg-beige flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative Background */}
            <div className="absolute top-0 left-0 w-full h-64 bg-forest rounded-b-[40%] shadow-2xl z-0" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-stone-100"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-terracotta rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-white">
                        <Utensils size={32} />
                    </div>
                    <h1 className="font-serif text-3xl font-bold text-forest mb-2">Rustic Roots</h1>
                    <div className="mb-4">
                        <span className="inline-block bg-terracotta text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">
                            DEMO MODE
                        </span>
                    </div>
                    <p className="text-stone-500 text-sm">Select your table to begin the dining experience.</p>
                </div>

                {/* Table Grid */}
                <div className="grid grid-cols-4 gap-3 mb-8">
                    {tables.map((num) => (
                        <button
                            key={num}
                            onClick={() => setSelectedTable(num)}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center border-2 transition-all duration-300 ${selectedTable === num
                                ? 'border-forest bg-forest text-white shadow-lg scale-105'
                                : 'border-stone-200 bg-stone-50 text-stone-400 hover:border-terracotta hover:text-terracotta'
                                }`}
                        >
                            <span className="text-xs font-bold uppercase mb-1">Meja</span>
                            <span className="text-xl font-bold">{num}</span>
                        </button>
                    ))}
                </div>

                {/* Main Action */}
                <button
                    onClick={handleEnter}
                    disabled={!selectedTable}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${selectedTable
                        ? 'bg-terracotta text-white shadow-xl hover:bg-terracotta/90 hover:-translate-y-1'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                        }`}
                >
                    Masuk <ArrowRight size={20} />
                </button>

                {/* Staff Access Link (Moved from Welcome.tsx) */}
                <div className="mt-8 pt-6 border-t border-stone-100 text-center">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-stone-400 hover:text-forest text-xs font-bold flex items-center justify-center gap-1 mx-auto transition-colors"
                    >
                        <ShieldCheck size={12} />
                        STAFF / ADMIN ACCESS
                    </button>
                </div>
            </motion.div>

            <p className="absolute bottom-6 text-stone-400 text-xs text-center font-mono">
                Demo Mode • v1.0.0
            </p>
        </div>
    );
};

export default Landing;
