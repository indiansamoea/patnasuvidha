import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function BookingModal({ isOpen, onClose, business, selectedServiceIndex = 0 }) {
  const navigate = useNavigate();
  const { currentUser, lang } = useAppContext();
  const [step, setStep] = useState(1); // 1=Details, 2=Confirm
  
  const [form, setForm] = useState({
    dateIndex: 0,
    time: '',
    address: '',
    description: '',
    phone: currentUser?.phoneNumber || '',
    name: currentUser?.displayName || ''
  });

  const service = business.services?.[selectedServiceIndex] || business.services?.[0];
  const amount = service?.price || 0;

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return { 
      day: d.toLocaleDateString('en', { weekday: 'short' }), 
      date: d.getDate(), 
      month: d.toLocaleDateString('en', { month: 'short' }), 
      full: d.toISOString().split('T')[0] 
    };
  });

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', 
    '12:00 PM', '02:00 PM', '03:00 PM', 
    '05:00 PM', '06:00 PM', '07:00 PM'
  ];

  const handlePayment = async () => {
    if (!form.time || !form.address) {
      toast.error('Please fill all required fields');
      return;
    }

    const toastId = toast.loading('Initializing payment...');

    try {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          bookingDetails: {
            businessId: business.id,
            businessName: business.name,
            service: service?.name,
            date: dates[form.dateIndex].full,
            time: form.time,
            customerName: form.name,
            customerPhone: form.phone,
            customerAddress: form.address,
            description: form.description,
            userId: currentUser?.uid
          }
        })
      });

      const { orderId, key } = await response.json();

      const options = {
        key: key,
        amount: amount * 100,
        currency: "INR",
        name: "Patna Suvidha",
        description: `Booking for ${service?.name}`,
        order_id: orderId,
        handler: async function (response) {
          toast.loading('Verifying payment...', { id: toastId });
          const verifyRes = await fetch('/api/razorpay/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response)
          });
          
          if (verifyRes.ok) {
            toast.success('Booking Successful! 🚀', { id: toastId });
            onClose();
            navigate('/booking-success');
          } else {
            toast.error('Payment verification failed', { id: toastId });
          }
        },
        prefill: {
          name: form.name,
          contact: form.phone
        },
        theme: { color: "#ff9159" }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
      toast.dismiss(toastId);

    } catch (error) {
      console.error('Payment Error:', error);
      toast.error('Failed to initiate payment', { id: toastId });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-md bg-[#151a20] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1c2229] flex-shrink-0">
            <div>
              <h3 className="text-white font-bold text-lg font-['Plus_Jakarta_Sans']">Book Service</h3>
              <p className="text-gray-400 text-xs">{business.name} • {service?.name}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors">
              <i className="ph-bold ph-x text-xl"></i>
            </button>
          </div>

          <div className="p-6 overflow-y-auto hide-scrollbar space-y-6 flex-1">
            {/* Date Selection */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Select Date</label>
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {dates.map((d, i) => (
                  <button key={i} onClick={() => setForm(f => ({ ...f, dateIndex: i }))}
                    className={`flex-shrink-0 w-14 py-3 rounded-xl flex flex-col items-center transition-all ${
                      form.dateIndex === i ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-[#1c2229] text-gray-400'
                    }`}>
                    <span className="text-[10px] font-bold uppercase">{d.day}</span>
                    <span className="text-lg font-black">{d.date}</span>
                    <span className="text-[10px] uppercase">{d.month}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Available Slots</label>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, time: t }))}
                    className={`py-2.5 rounded-xl text-[13px] font-bold transition-all border ${
                      form.time === t ? 'bg-primary/10 border-primary text-primary' : 'bg-[#1c2229] border-white/5 text-gray-400'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Address & Description */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Service Address</label>
                <textarea 
                  value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Street, Landmark, Patna - 800xxx"
                  className="w-full bg-[#1c2229] border border-white/5 rounded-xl p-3 text-white text-sm outline-none focus:border-primary/50 transition-colors"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Issue Description</label>
                <textarea 
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Briefly describe the issue..."
                  className="w-full bg-[#1c2229] border border-white/5 rounded-xl p-3 text-white text-sm outline-none focus:border-primary/50 transition-colors"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Footer / CTA */}
          <div className="p-6 bg-[#1c2229] border-t border-white/5 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-400 text-sm">Service Fee</span>
              <span className="text-primary font-black text-xl">₹{amount.toLocaleString()}</span>
            </div>
            <button 
              onClick={handlePayment}
              disabled={!form.time || !form.address}
              className="w-full py-4 bg-primary hover:bg-primary-dark disabled:bg-gray-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98]"
            >
              Pay & Confirm Booking
            </button>
            <p className="text-center text-[10px] text-gray-500 mt-3 flex items-center justify-center gap-1">
              <i className="ph-fill ph-shield-check text-[#34d399]"></i> 100% Secure Payment via Razorpay
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
