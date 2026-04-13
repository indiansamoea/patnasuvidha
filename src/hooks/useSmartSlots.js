/**
 * useSmartSlots — Real-time Firestore-backed slot availability with Provider Logic
 * 
 * Logic:
 * 1. Fetches all ACTIVE providers for the category.
 * 2. Fetches all booked slots for the date.
 * 3. A slot is UNAVAILABLE if:
 *    - It's in the past.
 *    - Total active providers in category <= Total bookings in that slot.
 * 4. User History:
 *    - Finds the user's last booked provider for this category.
 *    - Checks if THAT specific provider is free in a slot.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
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
  const bufferMs = 30 * 60 * 1000; // 30 mins buffer

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
  const [bookedSlots, setBookedSlots] = useState({}); // Map: slotLabel -> providerIds[]
  const [activeProviders, setActiveProviders] = useState([]);
  const [userHistory, setUserHistory] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch ACTIVE providers for this category
  useEffect(() => {
    if (!categoryId || !db) return;
    
    const fetchProviders = async () => {
      try {
        const q = query(
          collection(db, 'businesses'),
          where('category', '==', categoryId),
          where('status', '==', 'active')
        );
        const snap = await getDocs(q);
        const provs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setActiveProviders(provs);
      } catch (e) {
        console.error('useSmartSlots: Error fetching providers:', e);
      }
    };
    fetchProviders();
  }, [categoryId]);

  // 2. Fetch all bookings for category + date
  useEffect(() => {
    if (!categoryId || !selectedDateStr || !db) return;
    setIsLoading(true);

    const fetchBookings = async () => {
      try {
        const q = query(
          collection(db, 'bookings'),
          where('categoryId', '==', categoryId),
          where('dateFull', '==', selectedDateStr),
          where('status', 'in', ['pending', 'confirmed', 'payment_initiated'])
        );
        const snap = await getDocs(q);
        const slotMap = {}; // label -> [providerId]

        snap.forEach(doc => {
          const data = doc.data();
          if (data.time) {
            if (!slotMap[data.time]) slotMap[data.time] = [];
            if (data.providerId) slotMap[data.time].push(data.providerId);
            else slotMap[data.time].push('unassigned'); // still counts against capacity
          }
        });

        setBookedSlots(slotMap);
      } catch (e) {
        setBookedSlots({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [categoryId, selectedDateStr]);

  // 3. Fetch user's history for this category
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
        if (!snap.empty) {
          setUserHistory({ id: snap.docs[0].id, ...snap.docs[0].data() });
        } else {
          setUserHistory(null);
        }
      } catch (e) {
        setUserHistory(null);
      }
    };

    fetchHistory();
  }, [currentUser, categoryId]);

  const pastSlots = useMemo(() => getPastSlots(selectedDateStr), [selectedDateStr]);

  // 4. Capacity and Preference Logic
  const slotStats = useMemo(() => {
    const stats = {};
    const totalCapacity = activeProviders.length || 1; // Fallback to 1

    ALL_TIME_SLOTS.forEach(slot => {
      const bookings = bookedSlots[slot] || [];
      const bookedCount = bookings.length;
      const isPast = pastSlots.has(slot);
      
      const isFull = bookedCount >= totalCapacity;
      const isUnavailable = isPast || isFull;

      const prevProviderId = userHistory?.providerId;
      const isPrevProviderFree = prevProviderId && !bookings.includes(prevProviderId);

      stats[slot] = {
        isUnavailable,
        isFull,
        isPast,
        bookedCount,
        capacity: totalCapacity,
        isPreferred: isPrevProviderFree && !isUnavailable
      };
    });
    return stats;
  }, [bookedSlots, activeProviders, pastSlots, userHistory]);

  const suggestedSlot = useMemo(() => {
    const preferred = ALL_TIME_SLOTS.find(s => slotStats[s].isPreferred);
    if (preferred) return preferred;
    return ALL_TIME_SLOTS.find(s => !slotStats[s].isUnavailable) || null;
  }, [slotStats]);

  const isSlotUnavailable = useCallback((slot) => slotStats[slot]?.isUnavailable, [slotStats]);
  const isSlotBooked = useCallback((slot) => slotStats[slot]?.bookedCount > 0, [slotStats]);
  const isSlotPast = useCallback((slot) => slotStats[slot]?.isPast, [slotStats]);
  const isSlotPreferred = useCallback((slot) => slotStats[slot]?.isPreferred, [slotStats]);

  return {
    isSlotUnavailable,
    isSlotBooked,
    isSlotPast,
    isSlotPreferred,
    suggestedSlot,
    userHistory,
    isLoading,
    activeProvidersCount: activeProviders.length,
    totalSlotsAvailable: ALL_TIME_SLOTS.filter(s => !slotStats[s].isUnavailable).length,
  };
}
