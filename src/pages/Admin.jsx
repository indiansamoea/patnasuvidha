import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { 
  ShieldCheck, LockSimple, ChartBar, Storefront, 
  CalendarCheck, Megaphone, PlusCircle, Gear, 
  Trash, Pencil, Star, Check, X, ArrowLeft
} from '@phosphor-icons/react';

export default function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState('');
  const { businesses, bookings, deals } = useAppContext();

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e13] p-6">
        <div className="w-full max-w-sm p-8 bg-[#151a20] rounded-2xl border border-white/5 text-center">
          <ShieldCheck size={48} className="mx-auto mb-4 text-primary" weight="fill" />
          <h2 className="text-xl font-bold text-white mb-6">Admin Login</h2>
          <input 
            type="password" 
            value={pass}
            onChange={e => setPass(e.target.value)}
            className="w-full p-4 rounded-xl bg-black/40 border border-white/10 text-white text-center mb-4"
            placeholder="Enter Password"
          />
          <button 
            onClick={() => pass === 'AARADH@2009' ? setAuthed(true) : alert('Wrong Password')}
            className="w-full p-4 bg-primary text-white font-bold rounded-xl"
          >
            ENTER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e13] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <ShieldCheck size={32} className="text-primary" weight="fill" />
            <h1 className="text-2xl font-bold">Admin Console</h1>
          </div>
          <button onClick={() => navigate('/')} className="px-4 py-2 bg-white/5 rounded-lg text-sm">Return Home</button>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          { [
            { label: 'Services', value: businesses.length, icon: Storefront },
            { label: 'Bookings', value: bookings.length, icon: CalendarCheck },
            { label: 'Active Deals', value: deals.length, icon: Megaphone }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="p-6 bg-[#151a20] rounded-2xl border border-white/5">
                <Icon size={20} className="text-primary mb-2" />
                <p className="text-xs text-gray-500 uppercase">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
              </div>
            );
          })}
        </div>

        <div className="p-10 text-center opacity-30">
          <ChartBar size={48} className="mx-auto mb-4" />
          <p>Admin Dashboard is Active</p>
        </div>
      </div>
    </div>
  );
}
