import React, { useEffect } from 'react';
import { ChevronRightIcon, ChevronLeftIcon, CheckCircleIcon } from './Icons';
import type { Screen } from '../types';

export const CAR_RENTAL_FLOW = [
  { id: 'start-reservation', title: 'Start A Car Reservation', path: '/reservations/car-rental/start' },
  { id: 'one-way-rental', title: 'One Way Car Rental', path: '/reservations/car-rental/one-way' },
  { id: 'long-term-rental', title: 'Long-Term Car Rental', path: '/reservations/car-rental/long-term' },
  { id: 'deals-and-coupons', title: 'All Deals and Coupons', path: '/reservations/car-rental/deals' },
  { id: 'manage-reservation', title: 'View / Modify / Cancel', path: '/reservations/car-rental/manage' }
];

export const BUSINESS_FLOW = [
  { id: 'business-solutions', title: 'Solutions for Business', path: '/reservations/business/solutions' },
  { id: 'corporate-services', title: 'Corporate Services', path: '/reservations/business/corporate' }
];

interface ReservationLayoutProps {
  view: string;
  setView: (v: string) => void;
  category: 'Car Rental' | 'Business';
  children: React.ReactNode;
  commonFooter: React.ReactNode;
}

export const ReservationLayout: React.FC<ReservationLayoutProps> = ({ view, setView, category, children, commonFooter }) => {
  const flow = category === 'Car Rental' ? CAR_RENTAL_FLOW : BUSINESS_FLOW;
  const currentIndex = flow.findIndex(f => f.id === view);
  const currentItem = flow[currentIndex];

  useEffect(() => {
    if (currentItem) {
      window.history.pushState(null, '', currentItem.path);
    }
  }, [currentItem]);

  const handleBack = () => {
    if (currentIndex > 0) setView(flow[currentIndex - 1].id);
  };

  const handleNext = () => {
    if (currentIndex < flow.length - 1) setView(flow[currentIndex + 1].id);
  };

  if (!currentItem) return <>{children}</>;

  return (
    <div className="bg-[#f9fafb] min-h-screen font-sans text-left flex flex-col">
      {/* Mobile Sticky Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 p-3 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-safe">
        <button onClick={handleBack} disabled={currentIndex === 0} className={`flex items-center px-4 py-2 ${currentIndex === 0 ? 'text-gray-300' : 'text-primary font-medium'}`}>
          <ChevronLeftIcon className="w-5 h-5 mr-1" /> Back
        </button>
        <button onClick={() => setView('home')} className="text-gray-600 font-bold px-4 py-2">Home</button>
        <button onClick={handleNext} disabled={currentIndex === flow.length - 1} className={`flex items-center px-4 py-2 ${currentIndex === flow.length - 1 ? 'text-gray-300' : 'text-primary font-medium'}`}>
          Next <ChevronRightIcon className="w-5 h-5 ml-1" />
        </button>
      </div>

      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col md:flex-row pb-20 md:pb-0">
        {/* Sidebar */}
        <aside className="hidden md:block w-72 shrink-0 p-6 border-r border-gray-200 bg-white min-h-[calc(100vh-80px)]">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 px-4">{category}</h3>
           <ul className="space-y-1.5">
             {flow.map(item => {
               const isActive = item.id === view;
               return (
                 <li key={item.id}>
                   <button 
                     onClick={() => setView(item.id)}
                     className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium text-sm flex items-center justify-between group ${isActive ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 hover:text-primary'}`}
                   >
                     {item.title}
                     <ChevronRightIcon className={`w-4 h-4 transition-transform ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0'}`} />
                   </button>
                 </li>
               )
             })}
           </ul>
           
           <div className="mt-12 px-4">
             <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
               <h4 className="text-sm font-bold text-blue-900 mb-2">Need Help?</h4>
               <p className="text-xs text-blue-700 mb-3">Our reservation specialists are available 24/7 to assist you.</p>
               <button onClick={() => setView('home')} className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition-colors w-full">Contact Support</button>
             </div>
           </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 max-w-full overflow-hidden flex flex-col">
          {/* Top Bar / Breadcrumb & Nav (Desktop) */}
          <nav className="bg-white border-b border-gray-100 py-4 px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium overflow-x-auto pb-2 sm:pb-0 hide-scrollbar whitespace-nowrap">
              <button onClick={() => setView('home')} className="hover:text-primary transition-colors flex items-center gap-1">
                <img src="https://i.ibb.co/6JVrf2Bt/XTASS-Logo.png" alt="XTASS" className="h-5 w-auto object-contain mr-2" />
                Home
              </button>
              <ChevronRightIcon className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-primary font-semibold">{category}</span>
              <ChevronRightIcon className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-gray-900 font-bold bg-gray-100 px-2 py-0.5 rounded-md">{currentItem.title}</span>
            </div>
            
            <div className="hidden md:flex items-center gap-3 shrink-0">
               <button 
                 onClick={handleBack} 
                 disabled={currentIndex === 0} 
                 className={`px-4 py-2 rounded-md border text-sm font-bold transition-colors ${currentIndex === 0 ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 shadow-sm'}`}
               >
                 &larr; Back
               </button>
               <button onClick={() => setView('home')} className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 font-bold text-sm shadow-sm transition-colors">
                 Home
               </button>
               <button 
                 onClick={handleNext} 
                 disabled={currentIndex === flow.length - 1} 
                 className={`px-5 py-2 rounded-md font-bold text-sm shadow-md transition-all flex items-center gap-2 ${currentIndex === flow.length - 1 ? 'bg-gray-300 text-white cursor-not-allowed' : 'bg-primary text-white hover:bg-primary/90 hover:scale-105 active:scale-95'}`}
               >
                 Next Step &rarr;
               </button>
            </div>
          </nav>

          <div className="flex-1 overflow-y-auto">
            {children}
            {commonFooter}
          </div>
        </div>
      </div>
    </div>
  );
};
