import React, { useState } from 'react';
import { FileText, List, Calendar, Download, Loader2, ArrowLeft, X, ChevronDown } from 'lucide-react';
import { ApiService } from '../../services/api';
import { ReportData } from '../../types';

type ViewState = 'SELECT' | 'FILTER' | 'LOADING' | 'RESULT';

const Reports: React.FC = () => {
  const [view, setView] = useState<ViewState>('SELECT');
  const [reportType, setReportType] = useState<'SALES' | 'LOGS'>('SALES');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState<ReportData | null>(null);

  const handleDownloadPDF = () => {
      const element = document.getElementById('report-printable');
      const filename = `Report-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      
      const opt = {
        margin:       0,
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Check if html2pdf loaded via CDN
      if ((window as any).html2pdf) {
           (window as any).html2pdf().set(opt).from(element).save();
      } else {
           alert("PDF Generator library not loaded. Falling back to Print.");
           window.print();
      }
  };

  const handleSelectType = (type: 'SALES' | 'LOGS') => {
    setReportType(type);
    setView('FILTER');
  };

  const generateReport = async () => {
    if (!startDate || !endDate) return;
    setView('LOADING');
    
    // Convert inputs to Date objects (start of day / end of day)
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59);

    const data = await ApiService.generateReport(reportType, start, end);
    setReportData(data);
    setView('RESULT');
  };

  const reset = () => {
    setView('SELECT');
    setReportData(null);
  };

  const cancelFilter = () => {
    setView('SELECT');
  }

  // --- VIEW: SELECT TYPE ---
  if (view === 'SELECT') {
    return (
      <div className="w-full flex flex-col pb-10 md:h-full md:pb-0">
        <h2 className="font-serif text-3xl font-bold text-charcoal mb-2">Reports & Logs</h2>
        <p className="text-stone-500 mb-8">Generate detailed sales reports or view operational logs.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
          {/* Sales Report Card */}
          <button 
            onClick={() => handleSelectType('SALES')}
            className="bg-white p-8 rounded-2xl border-2 border-stone-200 hover:border-forest hover:bg-forest/5 transition-all text-left group shadow-sm hover:shadow-md"
          >
            <div className="bg-forest/10 w-16 h-16 rounded-full flex items-center justify-center text-forest mb-6 group-hover:scale-110 transition-transform">
              <FileText size={32} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">Sales Report</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Consolidated revenue, top selling items, and performance metrics. Best for management reviews (1D, 1W, 1M, 1Y).
            </p>
          </button>

          {/* Logs Card */}
          <button 
             onClick={() => handleSelectType('LOGS')}
             className="bg-white p-8 rounded-2xl border-2 border-stone-200 hover:border-terracotta hover:bg-terracotta/5 transition-all text-left group shadow-sm hover:shadow-md"
          >
            <div className="bg-terracotta/10 w-16 h-16 rounded-full flex items-center justify-center text-terracotta mb-6 group-hover:scale-110 transition-transform">
              <List size={32} />
            </div>
            <h3 className="font-serif text-2xl font-bold text-charcoal mb-2">Order Logs</h3>
            <p className="text-stone-500 text-sm leading-relaxed">
              Detailed history of every transaction, timestamps, and order statuses. Useful for auditing and tracking operations.
            </p>
          </button>
        </div>
      </div>
    );
  }

  // --- VIEW: FILTER / LOADING / RESULT ---
  return (
    <div className="w-full flex flex-col relative md:h-full pb-10 md:pb-0">
      {/* Back Button (Only visible in Result View, Filter has its own cancel) */}
      {view === 'RESULT' && (
        <div className="mb-6 shrink-0">
           <button onClick={reset} className="flex items-center text-stone-500 hover:text-forest">
              <ArrowLeft size={18} className="mr-2" /> Back to Selection
           </button>
        </div>
      )}

      {/* FILTER POPCARD (Overlay) */}
      {view === 'FILTER' && (
        <div className="absolute inset-0 z-10 flex items-start justify-center pt-20 bg-stone-100/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-stone-200 max-w-md w-full animate-in fade-in zoom-in duration-200 relative">
            
            {/* Close/Cancel Icon */}
            <button 
              onClick={cancelFilter}
              className="absolute top-4 right-4 text-stone-400 hover:text-charcoal transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="font-serif text-xl font-bold text-charcoal mb-4">Select Date Range</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Start Date</label>
                <div className="relative bg-white border border-stone-300 rounded-lg shadow-sm focus-within:border-forest focus-within:ring-1 focus-within:ring-forest">
                  <input 
                    type="date" 
                    className="w-full pl-10 pr-10 py-2 bg-transparent text-charcoal outline-none rounded-lg cursor-pointer relative z-10"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 z-0" size={18} />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 z-0" size={18} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">End Date</label>
                 <div className="relative bg-white border border-stone-300 rounded-lg shadow-sm focus-within:border-forest focus-within:ring-1 focus-within:ring-forest">
                  <input 
                    type="date" 
                    className="w-full pl-10 pr-10 py-2 bg-transparent text-charcoal outline-none rounded-lg cursor-pointer relative z-10"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 z-0" size={18} />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 z-0" size={18} />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={cancelFilter}
                className="flex-1 py-3 bg-stone-100 text-stone-600 rounded-xl font-bold hover:bg-stone-200 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={generateReport}
                disabled={!startDate || !endDate}
                className={`flex-1 py-3 rounded-xl font-bold transition-all ${!startDate || !endDate ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-forest text-beige hover:bg-forest/90'}`}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {view === 'LOADING' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stone-100/80 backdrop-blur-sm">
           <Loader2 size={48} className="text-forest animate-spin mb-4" />
           <p className="text-stone-600 font-medium">Processing Data...</p>
           <p className="text-xs text-stone-400">Aggregating Sales & Logs</p>
        </div>
      )}

      {/* RESULT VIEW */}
      {view === 'RESULT' && reportData && (
        <div className="flex-1 flex flex-col md:overflow-hidden pb-10 md:pb-0">
          {/* Print Style */}
          <style>{`
            @media print {
              @page { size: A4; margin: 10mm; }
              html, body {
                width: 210mm;
                height: 297mm;
                background: white;
                -webkit-print-color-adjust: exact;
              }
              body * { visibility: hidden; height: 0; overflow: hidden; }
              
              /* Reset container visibility */
              #report-printable, #report-printable * { 
                visibility: visible; 
                height: auto; 
                overflow: visible; 
              }
              
              /* Force desktop-like width and reset position */
              #report-printable { 
                position: absolute; 
                left: 0; 
                top: 0; 
                width: 100% !important; 
                min-width: 100% !important;
                margin: 0;
                padding: 0;
                box-shadow: none;
                background: white;
              }

              /* Scale down content if needed */
              table { font-size: 10pt; width: 100%; border-collapse: collapse; }
              th, td { padding: 4px 8px; border-bottom: 1px solid #eee; }
              th { background-color: #f5f5f5 !important; color: #333 !important; }
            }
          `}</style>

          <div className="flex justify-between items-center mb-4 shrink-0">
            <h2 className="font-serif text-2xl font-bold text-charcoal">Report Result</h2>
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-terracotta text-white px-4 py-2 rounded-lg hover:bg-terracotta/90 transition shadow-md"
            >
              <Download size={18} /> Download PDF
            </button>
          </div>

          <div className="flex-1 bg-stone-200 rounded-xl p-4 md:p-8 md:overflow-auto overflow-hidden">
            {/* PAPER PREVIEW */}
            <div className="w-full h-full overflow-auto">
                <div id="report-printable" className="bg-white max-w-4xl mx-auto p-6 md:p-12 shadow-lg min-h-[600px] md:min-h-[800px] text-charcoal">
                {/* Report Header */}
                <div className="border-b-2 border-forest pb-4 md:pb-6 mb-4 md:mb-8 flex justify-between items-end">
                    <div>
                    <h1 className="font-serif text-2xl md:text-4xl font-bold text-forest">Rustic Roots</h1>
                    <p className="text-stone-500 uppercase tracking-widest text-[10px] md:text-xs mt-1">Restaurant Management System</p>
                    </div>
                    <div className="text-right">
                    <h2 className="text-lg md:text-2xl font-bold text-charcoal">{reportData.type} REPORT</h2>
                    <p className="text-[10px] md:text-sm text-stone-500">
                        {reportData.period.start.toLocaleDateString()} - {reportData.period.end.toLocaleDateString()}
                    </p>
                    </div>
                </div>

                {/* SALES SUMMARY */}
                {reportData.type === 'SALES' && (
                    <div className="space-y-6 md:space-y-8">
                    <div className="grid grid-cols-3 gap-2 md:gap-6">
                        <div className="bg-stone-50 p-2 md:p-4 rounded border border-stone-200">
                        <p className="text-[8px] md:text-xs text-stone-500 uppercase">Total Revenue</p>
                        <p className="text-sm md:text-2xl font-bold text-forest">Rp {reportData.summary.totalRevenue.toLocaleString('id-ID')}</p>
                        </div>
                        <div className="bg-stone-50 p-2 md:p-4 rounded border border-stone-200">
                        <p className="text-[8px] md:text-xs text-stone-500 uppercase">Total Orders</p>
                        <p className="text-sm md:text-2xl font-bold text-charcoal">{reportData.summary.totalOrders}</p>
                        </div>
                        <div className="bg-stone-50 p-2 md:p-4 rounded border border-stone-200">
                        <p className="text-[8px] md:text-xs text-stone-500 uppercase">Avg Order Value</p>
                        <p className="text-sm md:text-2xl font-bold text-terracotta">Rp {Math.round(reportData.summary.avgOrderValue).toLocaleString('id-ID')}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold border-b border-stone-200 pb-2 mb-4 text-sm md:text-base">Top Selling Items</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-[10px] md:text-sm">
                            <thead className="bg-stone-100 text-stone-600">
                                <tr>
                                <th className="p-2">Item Name</th>
                                <th className="p-2 text-right">Qty Sold</th>
                                <th className="p-2 text-right">Revenue Generated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                                {reportData.topItems?.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="p-2 font-medium">{item.name}</td>
                                    <td className="p-2 text-right">{item.quantity}</td>
                                    <td className="p-2 text-right">Rp {item.revenue.toLocaleString('id-ID')}</td>
                                </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div className="mt-8 p-4 bg-stone-50 border border-stone-200 rounded text-center text-[8px] md:text-xs text-stone-400">
                        End of Sales Report • Generated on {reportData.generatedAt.toLocaleString()}
                    </div>
                    </div>
                )}

                {/* LOGS TABLE */}
                {reportData.type === 'LOGS' && (
                    <div className="space-y-6">
                        <p className="text-xs md:text-sm text-stone-500 mb-4">Showing all transactions recorded within the selected period.</p>
                        <div className="w-full overflow-x-auto">
                        <table className="w-full text-left text-[10px] md:text-xs min-w-[600px] md:min-w-0">
                            <thead className="bg-stone-100 text-stone-600 uppercase">
                            <tr>
                                <th className="p-2">Time</th>
                                <th className="p-2">Order ID</th>
                                <th className="p-2 w-1/3">Items</th>
                                <th className="p-2 text-center">Table</th>
                                <th className="p-2 text-right">Total</th>
                                <th className="p-2 text-center">Payment</th>
                                <th className="p-2 text-center">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 font-mono">
                            {reportData.orders?.map((order) => (
                                <tr key={order.id} className="align-top">
                                <td className="p-2 whitespace-nowrap">{new Date(order.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                                <td className="p-2 font-bold">{order.id}</td>
                                <td className="p-2">
                                    <div className="flex flex-col gap-1">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex justify-between border-b border-stone-100 last:border-0 pb-1 last:pb-0">
                                                <span className="font-sans text-stone-600">{item.name}</span>
                                                <span className="font-bold whitespace-nowrap ml-2">x{item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-2 text-center">{order.tableId}</td>
                                <td className="p-2 text-right whitespace-nowrap">Rp {order.total.toLocaleString('id-ID')}</td>
                                <td className="p-2 text-center">{order.paymentMethod || '-'}</td>
                                <td className="p-2 text-center">
                                    <span className={`px-1 rounded ${order.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                                    {order.status}
                                    </span>
                                </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </div>
                        <div className="mt-8 p-4 bg-stone-50 border border-stone-200 rounded text-center text-[8px] md:text-xs text-stone-400">
                            End of Log Report • Generated on {reportData.generatedAt.toLocaleString()}
                        </div>
                    </div>
                )}

                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;