import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const ALL_TIME_SLOTS = [
  '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '2:00 PM', '3:00 PM',
  '5:00 PM', '6:00 PM', '7:00 PM',
];

function getPastSlots(dateStr) {
  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr !== todayStr) return new Set();

  const now = new Date();
  const bufferMs = 90 * 60 * 1000; // 90 mins buffer for readiness

  const pastSlots = new Set();
  for (const slotLabel of ALL_TIME_SLOTS) {
    const [time, period] = slotLabel.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;

    const slotTime = new Date();
    slotTime.setHours(hours, minutes || 0, 0, 0);

    if (slotTime.getTime() < now.getTime() + bufferMs) {
      pastSlots.add(slotLabel);
    }
  }
  return pastSlots;
}

export function useSmartSlots(categoryId, selectedDateStr, currentUser) {
  const [bookedSlots, setBookedSlots] = useState({});
  const [activeProviders, setActiveProviders] = useState([]);
  const [userHistory, setUserHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Fetch ACTIVE providers (Real-time)
  useEffect(() => {
    if (!categoryId || !db) return;
    
    const q = query(
      collection(db, 'businesses'),
      where('category', '==', categoryId),
      where('status', '==', 'active')
    );

    const unsub = onSnapshot(q, (snap) => {
      setActiveProviders(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      console.error('Provider fetch error:', err);
    });

    return () => unsub();
  }, [categoryId]);

  // 2. Fetch bookings for date (Real-time)
  useEffect(() => {
    if (!categoryId || !selectedDateStr || !db) return;
    setIsLoading(true);

    const q = query(
      collection(db, 'bookings'),
      where('categoryId', '==', categoryId),
      where('dateFull', '==', selectedDateStr),
      where('status', 'in', ['pending', 'confirmed', 'payment_initiated'])
    );

    const unsub = onSnapshot(q, (snap) => {
      const slotMap = {};
      snap.forEach(doc => {
        const data = doc.data();
        if (data.time) {
          if (!slotMap[data.time]) slotMap[data.time] = [];
          slotMap[data.time].push(data.providerId || 'unassigned');
        }
      });
      setBookedSlots(slotMap);
      setIsLoading(false);
    }, (err) => {
      console.error('Bookings fetch error:', err);
      setIsLoading(false);
    });

    return () => unsub();
  }, [categoryId, selectedDateStr]);

  // 3. User History
  useEffect(() => {
    if (!currentUser || !categoryId || !db) return;
    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, 'bookings'),
          where('userId', '==', currentUser.uid),
          where('categoryId', '==', categoryId),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        const snap = await getDocs(q);
        if (!snap.empty) setUserHistory({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } catch (e) {}
    };
    fetchHistory();
  }, [currentUser, categoryId]);

  const pastSlots = useMemo(() => getPastSlots(selectedDateStr), [selectedDateStr]);

  const slotStats = useMemo(() => {
    const stats = {};
    const totalCapacity = Math.max(activeProviders.length, 1);

    ALL_TIME_SLOTS.forEach(slot => {
      const bookings = bookedSlots[slot] || [];
      const bookedCount = bookings.length;
      const isPast = pastSlots.has(slot);
      const isFull = bookedCount >= totalCapacity;
      
      const prevProviderId = userHistory?.providerId;
      const isPrevProviderFree = prevProviderId && !bookings.includes(prevProviderId);

      stats[slot] = {
        isUnavailable: isPast || isFull,
        isFull,
        isPast,
        bookedCount,
        capacity: totalCapacity,
        isPreferred: isPrevProviderFree && !(isPast || isFull)
      };
    });
    return stats;
  }, [bookedSlots, activeProviders, pastSlots, userHistory]);

  const suggestedSlot = useMemo(() => {
    const preferred = ALL_TIME_SLOTS.find(s => slotStats[s].isPreferred);
    if (preferred) return preferred;
    return ALL_TIME_SLOTS.find(s => !slotStats[s].isUnavailable) || null;
  }, [slotStats]);

  return {
    isSlotUnavailable: (slot) => slotStats[slot]?.isUnavailable,
    isSlotBooked: (slot) => slotStats[slot]?.bookedCount > 0,
    isSlotPast: (slot) => slotStats[slot]?.isPast,
    isSlotPreferred: (slot) => slotStats[slot]?.isPreferred,
    slotStats,
    suggestedSlot,
    isLoading,
    activeProvidersCount: activeProviders.length,
    totalSlotsAvailable: ALL_TIME_SLOTS.filter(s => !slotStats[s].isUnavailable).length,
  };
}
