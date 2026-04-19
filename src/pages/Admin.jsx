import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES } from '../utils/categories';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:           { label: 'Pending',           color: 'var(--primary)', bg: 'hsla(var(--p-h), 100%, 50%, 0.1)',  icon: 'ph-clock' },
  confirmed:         { label: 'Confirmed',          color: 'var(--secondary)', bg: 'hsla(142, 76%, 36%, 0.1)', icon: 'ph-check-circle' },
  completed:         { label: 'Completed',          color: 'var(--secondary)', bg: 'hsla(142, 76%, 36%, 0.2)',  icon: 'ph-seal-check' },
  cancelled:         { label: 'Cancelled',          color: 'var(--error)', bg: 'hsla(0, 72%, 51%, 0.1)',  icon: 'ph-x-circle' },
  payment_initiated: { label: 'Payment Pending',    color: '#a855f7', bg: 'rgba(168,85,247,0.12)', icon: 'ph-credit-card' },
};

const GRADIENT_PRESETS = [
  ['#ff8c00', '#ff4500'],
  ['#06b6d4', '#3b82f6'],
  ['#22c55e', '#16a34a'],
  ['#a855f7', '#ec4899'],
  ['#f59e0b', '#ef4444'],
  ['#6366f1', '#8b5cf6'],
];

// ─── Shared tiny components ───────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
      padding: '0.2rem 0.6rem', borderRadius: '999px',
      background: cfg.bg, color: cfg.color,
      fontFamily: 'var(--font-body)', fontSize: '0.6875rem', fontWeight: 800,
      border: `1px solid ${cfg.color}40`,
    }}>
      <i className={`ph-fill ${cfg.icon}`} style={{ fontSize: '0.75rem' }} />
      {cfg.label}
    </span>
  );
}

function TabBtn({ id, label, icon, active, onClick, badge }) {
  return (
    <button
      id={id}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.375rem',
        padding: '0.625rem 0.875rem', borderRadius: '12px',
        fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 700,
        background: active ? 'var(--primary-container)' : 'transparent',
        color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
        border: active ? '1px solid var(--primary)40' : '1px solid transparent',
        cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
        position: 'relative',
      }}
    >
      <i className={`ph-fill ${icon}`} style={{ fontSize: '1rem' }} />
      {label}
      {badge > 0 && (
        <span style={{
          position: 'absolute', top: '-4px', right: '-4px',
          background: '#ef4444', color: '#fff',
          width: '18px', height: '18px', borderRadius: '50%',
          fontSize: '0.5625rem', fontWeight: 900,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{badge > 99 ? '99+' : badge}</span>
      )}
    </button>
  );
}

// ─── Booking Detail Modal ─────────────────────────────────────────────────────
function BookingDetailModal({ booking, providers = [], allBookings = [], onClose, onStatusChange }) {
  const [status, setStatus] = useState(booking.status || 'pending');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onStatusChange(booking.id, status);
    setSaving(false);
    onClose();
  };

  const fields = [
    { icon: 'ph-gear', label: 'Service', value: booking.service },
    { icon: 'ph-tag', label: 'Category', value: booking.category },
    { icon: 'ph-calendar-blank', label: 'Date', value: booking.date },
    { icon: 'ph-clock', label: 'Time', value: booking.time },
    { icon: 'ph-map-pin', label: 'Address', value: booking.customerAddress || booking.address },
    { icon: 'ph-user', label: 'Customer', value: booking.customerName },
    { icon: 'ph-phone', label: 'Phone', value: booking.customerPhone },
    { icon: 'ph-hand-coins', label: 'Payment', value: booking.paymentMethod === 'pay_now' ? 'Pay Now (Online)' : 'Pay After Service' },
    { icon: 'ph-currency-inr', label: 'Amount', value: booking.amount ? `₹${Number(booking.amount).toLocaleString('en-IN')}` : 'N/A' },
    { icon: 'ph-identification-card', label: 'Booking ID', value: booking.id },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: '520px',
        background: 'var(--surface)', borderRadius: '24px 24px 0 0',
        padding: '1.5rem 1.25rem 2rem', maxHeight: '90vh', overflowY: 'auto',
        animation: 'slideUp 0.3s cubic-bezier(0.34,1.2,0.64,1)',
      }}>
        {/* Handle */}
        <div style={{ width: '40px', height: '4px', borderRadius: '99px', background: 'var(--outline-variant)', margin: '0 auto 1rem' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 800, color: 'var(--on-surface)' }}>
            Booking Details
          </h3>
          <StatusBadge status={booking.status} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
          {fields.map((f, i) => f.value && (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem' }}>
              <i className={`ph-fill ${f.icon}`} style={{ color: 'var(--primary)', fontSize: '0.875rem', marginTop: '0.125rem', flexShrink: 0 }} />
              <div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>{f.label}: </span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--on-surface)', wordBreak: 'break-all' }}>{f.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Status updater */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>
            Update Status
          </p>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setStatus(key)}
                style={{
                  padding: '0.375rem 0.875rem', borderRadius: '999px',
                  fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700,
                  background: status === key ? cfg.bg : 'var(--surface-container)',
                  color: status === key ? cfg.color : 'var(--on-surface-variant)',
                  border: `1px solid ${status === key ? cfg.color : 'var(--outline-variant)'}`,
                  cursor: 'pointer', transition: 'all 0.15s',
                  height: '32px', display: 'flex', alignItems: 'center'
                }}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Provider Assignment */}
        <div style={{ marginBottom: '1.5rem' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--on-surface-variant)', marginBottom: '0.75rem' }}>
            {booking.providerId ? 'Assigned Provider' : 'Assign Provider'}
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {providers
              .filter(p => !booking.categoryId || p.category === booking.categoryId || p.category === 'all')
              .map(p => {
                const isAssigned = booking.providerId === p.id;
                // Calculate load (active bookings)
                const load = allBookings?.filter(b => b.providerId === p.id && ['pending', 'confirmed', 'payment_initiated'].includes(b.status)).length || 0;
                
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (isAssigned) return;
                      onStatusChange(booking.id, 'confirmed', { 
                        providerId: p.id, 
                        providerName: p.name,
                        providerPhone: p.phone || ''
                      });
                      onClose();
                    }}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.75rem 1rem', borderRadius: '16px',
                      background: isAssigned ? 'var(--primary-container)' : 'var(--surface-container-high)',
                      border: isAssigned ? '1px solid var(--primary)' : '1px solid transparent',
                      cursor: isAssigned ? 'default' : 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className={`ph-fill ${isAssigned ? 'ph-user-check' : 'ph-user-plus'}`} style={{ color: 'var(--primary)' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 800, color: 'var(--on-surface)' }}>{p.name}</p>
                        <p style={{ fontSize: '0.625rem', color: 'var(--on-surface-variant)' }}>
                          {p.phone || 'No phone'} • <span style={{ color: load > 3 ? '#ef4444' : load > 0 ? '#f59e0b' : '#22c55e', fontWeight: 800 }}>{load} active tasks</span>
                        </p>
                      </div>
                    </div>
                    {isAssigned ? (
                      <i className="ph-fill ph-check-circle" style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
                    ) : (
                      <div style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--primary)', padding: '0.25rem 0.625rem', borderRadius: '6px', background: 'var(--primary-container)' }}>
                        ASSIGN
                      </div>
                    )}
                  </button>
                );
              })}
            {providers.filter(p => !booking.categoryId || p.category === booking.categoryId || p.category === 'all').length === 0 && (
              <p style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'center', padding: '1rem' }}>No providers found for this category.</p>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-lg)',
            fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 800,
            background: 'var(--gradient-primary)', color: 'var(--on-primary)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
          }}
        >
          {saving
            ? <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Saving...</>
            : <><i className="ph-fill ph-floppy-disk" />Save Changes</>
          }
        </button>
      </div>
    </div>
  );
}

// ─── Offer Form Modal ─────────────────────────────────────────────────────────
function OfferFormModal({ offer, onClose, onSave }) {
  const [form, setForm] = useState({
    title: offer?.title || '',
    subtitle: offer?.subtitle || '',
    category: offer?.category || 'plumber',
    icon: offer?.icon || 'ph-tag',
    gradient: offer?.gradient || GRADIENT_PRESETS[0],
    active: offer?.active ?? true,
  });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  const icons = ['ph-tag', 'ph-lightning', 'ph-fire', 'ph-star', 'ph-gift', 'ph-percent', 'ph-megaphone', 'ph-seal-check', 'ph-hand-heart', 'ph-rocket'];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: '520px',
        background: 'var(--surface)', borderRadius: '24px 24px 0 0',
        padding: '1.5rem 1.25rem 2rem', maxHeight: '90vh', overflowY: 'auto',
        animation: 'slideUp 0.3s cubic-bezier(0.34,1.2,0.64,1)',
      }}>
        <div style={{ width: '40px', height: '4px', borderRadius: '99px', background: 'var(--outline-variant)', margin: '0 auto 1rem' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '1.25rem' }}>
          {offer ? 'Edit Offer' : 'New Service Offer'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Title */}
          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.375rem' }}>
              Title *
            </label>
            <input
              id="offer-title"
              className="input-field"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="e.g. 50% Off AC Service"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.375rem' }}>
              Subtitle
            </label>
            <input
              id="offer-subtitle"
              className="input-field"
              value={form.subtitle}
              onChange={e => set('subtitle', e.target.value)}
              placeholder="e.g. Summer special — limited time only"
            />
          </div>

          {/* Category */}
          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.375rem' }}>
              Links to Category
            </label>
            <select
              id="offer-category"
              className="input-field"
              value={form.category}
              onChange={e => set('category', e.target.value)}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Icon */}
          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.375rem' }}>
              Icon
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {icons.map(ic => (
                <button
                  key={ic}
                  onClick={() => set('icon', ic)}
                  style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: form.icon === ic ? 'var(--primary-container)' : 'var(--surface-container)',
                    border: form.icon === ic ? '1.5px solid var(--primary)' : '1px solid var(--outline-variant)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  }}
                >
                  <i className={`ph-fill ${ic}`} style={{ color: form.icon === ic ? 'var(--primary)' : 'var(--on-surface-variant)', fontSize: '1.125rem' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Gradient */}
          <div>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.375rem' }}>
              Color
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {GRADIENT_PRESETS.map((g, i) => (
                <button
                  key={i}
                  onClick={() => set('gradient', g)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`,
                    border: JSON.stringify(form.gradient) === JSON.stringify(g) ? '3px solid var(--on-surface)' : '3px solid transparent',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Active toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)' }}>Show on Home page</span>
            <button
              onClick={() => set('active', !form.active)}
              style={{
                width: '48px', height: '28px', borderRadius: '999px',
                background: form.active ? 'var(--primary)' : 'var(--surface-container-high)',
                border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s',
              }}
            >
              <div style={{
                position: 'absolute', top: '2px',
                left: form.active ? '22px' : '2px',
                width: '24px', height: '24px', borderRadius: '50%',
                background: '#fff', transition: 'left 0.2s',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>
        </div>

        {/* Preview */}
        <div style={{
          margin: '1.25rem 0',
          padding: '1rem 1.25rem', borderRadius: 'var(--radius-lg)',
          background: `linear-gradient(135deg, ${form.gradient[0]}20, ${form.gradient[1]}20)`,
          border: `1px solid ${form.gradient[0]}40`,
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: '0.375rem' }}>Preview</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `linear-gradient(135deg, ${form.gradient[0]}, ${form.gradient[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <i className={`ph-fill ${form.icon}`} style={{ color: '#fff', fontSize: '1.25rem' }} />
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--on-surface)' }}>{form.title || 'Title'}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{form.subtitle || 'Subtitle'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !form.title.trim()}
          style={{
            width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-lg)',
            fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 800,
            background: form.title.trim() ? 'var(--gradient-primary)' : 'var(--surface-container-high)',
            color: form.title.trim() ? 'var(--on-primary)' : 'var(--on-surface-variant)',
            border: 'none', cursor: form.title.trim() ? 'pointer' : 'not-allowed',
          }}
        >
          {saving ? 'Saving...' : offer ? 'Save Changes' : 'Create Offer'}
        </button>
      </div>
    </div>
  );
}

// ─── Business Form Modal ─────────────────────────────────────────────────────
function BusinessFormModal({ business, onClose, onSave }) {
  const [form, setForm] = useState({
    name:        business?.name || '',
    category:    business?.category || 'plumber',
    phone:       business?.phone || '',
    address:     business?.address || '',
    description: business?.description || '',
    image:       business?.image || '',
    isVerified:  business?.isVerified ?? true,
    isFeatured:  business?.isFeatured ?? false,
    priceRange:  business?.priceRange || '₹500 - ₹2,000',
    status:      business?.status || 'active',
  });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  const categories = CATEGORIES.filter(c => c.id !== 'all');

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'relative', width: '100%', maxWidth: '520px',
        background: 'var(--surface)', borderRadius: '24px 24px 0 0',
        padding: '1.5rem 1.25rem 2rem', maxHeight: '90vh', overflowY: 'auto',
        animation: 'slideUp 0.3s cubic-bezier(0.34,1.2,0.64,1)',
      }}>
        <div style={{ width: '40px', height: '4px', borderRadius: '99px', background: 'var(--outline-variant)', margin: '0 auto 1rem' }} />
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '1.25rem' }}>
          {business ? 'Edit Business' : 'New Service Provider'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Provider Name *</label>
            <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Ramesh Electricals" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Category</label>
              <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Phone</label>
              <input className="input-field" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="91XXXXXXXX" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Address</label>
            <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full street address in Patna" />
          </div>

          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Image URL</label>
            <input className="input-field" value={form.image} onChange={e => set('image', e.target.value)} placeholder="Unsplash URL or blank" />
          </div>

          <div>
            <label style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.375rem', textTransform: 'uppercase' }}>Short Description</label>
            <textarea className="input-field" style={{ minHeight: '80px', resize: 'none' }} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What do they specialize in?" />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-container)', padding: '0.75rem', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Featured</span>
              <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-container)', padding: '0.75rem', borderRadius: '12px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Verified</span>
              <input type="checkbox" checked={form.isVerified} onChange={e => set('isVerified', e.target.checked)} />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !form.name.trim()}
          style={{
            width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-lg)',
            fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 800,
            background: form.name.trim() ? 'var(--gradient-primary)' : 'var(--surface-container-high)',
            color: form.name.trim() ? 'var(--on-primary)' : 'var(--on-surface-variant)',
            border: 'none', cursor: 'pointer',
          }}
        >
          {saving ? 'Saving...' : business ? 'Update Business' : 'Add Business'}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ADMIN PAGE ──────────────────────────────────────────────────────────
export default function Admin() {
  const navigate = useNavigate();
  const {
    currentUser, currentUserRole, isAdmin,
    allBookings, updateBookingStatus,
    categories, addCategory, updateCategory, deleteCategory,
    providers, addBusiness, updateBusiness, deleteBusiness,
    serviceOffers, addServiceOffer, updateServiceOffer, deleteServiceOffer,
    settings, updateSettings, addNotification, bookingsEnabled,
  } = useAppContext();

  // Statistics and Analytics Engine
  const stats = useMemo(() => {
    const total = allBookings?.length || 0;
    const pending = allBookings?.filter(b => ['pending', 'confirmed', 'payment_initiated'].includes(b.status)).length || 0;
    const completed = allBookings?.filter(b => b.status === 'completed').length || 0;
    const revenue = allBookings?.filter(b => b.status === 'completed').reduce((acc, b) => acc + (Number(b.amount) || 0), 0) || 0;
    return { total, pending, completed, revenue, providers: providers?.length || 0 };
  }, [allBookings, providers]);

  const [tab, setTab] = useState('bookings');
  const [bookingFilter, setBookingFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [offerModal, setOfferModal] = useState(null); 
  const [businessModal, setBusinessModal] = useState(null); 
  const [categoryModal, setCategoryModal] = useState(null); 

  const [telegramForm, setTelegramForm] = useState({
    telegramBotToken: settings.telegramBotToken || '',
    telegramAdminChatId: settings.telegramAdminChatId || '',
    telegramCustomChatId: settings.telegramCustomChatId || '',
    telegramCustomName: settings.telegramCustomName || 'Coordinator',
  });
  const [notifForm, setNotifForm] = useState({ title: '', subtitle: '' });
  const [sendingNotif, setSendingNotif] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState(null);
  const [seeding, setSeeding] = useState(false);

  // Seeding Data
  const SEED_DATA = CATEGORIES.reduce((acc, cat) => {
    if (cat.id === 'all') return acc;
    acc[cat.id] = { ...cat };
    return acc;
  }, {});
    },
    'pest-control': {
      hero: 'https://images.unsplash.com/photo-1632142695542-42a3a9b30138?auto=format&fit=crop&w=1200&q=80',
      title: 'Pest Control Services', titleHi: 'कीट नियंत्रण सेवा',
      desc: 'Cockroach, termite, mosquito, and bed bug treatment for homes and offices.',
      descHi: 'घरों और कार्यालयों के लिए कीट उपचार।',
      icon: 'ph-bug',
      services: [
        { name: 'Cockroach Treatment', price: 699 }, { name: 'Termite Treatment', price: 1499 }, { name: 'Mosquito Control', price: 499 },
        { name: 'Bed Bug Treatment', price: 999 }, { name: 'General Pest Control', price: 599 },
      ],
    },
  };

  const handleSeedCategories = async () => {
    if (!window.confirm("This will populate your database with 15+ default categories. Continue?")) return;
    setSeeding(true);
    try {
      for (const [id, data] of Object.entries(SEED_DATA)) {
        await addCategory({ id, ...data, name: id.charAt(0).toUpperCase() + id.slice(1).replace('-', ' ') });
      }
      alert("Seeding complete!");
    } catch (e) {
      console.error(e);
      alert("Seeding failed: " + e.message);
    }
    setSeeding(false);
  };

  const handleSendNotification = async () => {
    if (!notifForm.title) return;
    setSendingNotif(true);
    await addNotification({ title: notifForm.title, subtitle: notifForm.subtitle });
    setNotifForm({ title: '', subtitle: '' });
    setSendingNotif(false);
    alert('Notification Sent!');
  };

  const handleToggleAvailability = async () => {
    setSavingSettings(true);
    await updateSettings({ bookingsEnabled: !bookingsEnabled });
    setSavingSettings(false);
  };

  // Sync settings into local form when Firestore updates
  useEffect(() => {
    setTelegramForm({
      telegramBotToken: settings.telegramBotToken || '',
      telegramAdminChatId: settings.telegramAdminChatId || '',
      telegramCustomChatId: settings.telegramCustomChatId || '',
      telegramCustomName: settings.telegramCustomName || 'Coordinator',
    });
  }, [settings]);

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div>
          <i className="ph-fill ph-lock-simple" style={{ fontSize: '3rem', color: 'var(--primary)', display: 'block', marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--on-surface)', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Login Required</h2>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem', fontFamily: 'var(--font-body)' }}>Please log in to access the admin console.</p>
          <button onClick={() => navigate('/')} style={{ padding: '0.75rem 1.5rem', background: 'var(--gradient-primary)', color: 'var(--on-primary)', borderRadius: '999px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>Go Back</button>
        </div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
        <div>
          <i className="ph-fill ph-shield-warning" style={{ fontSize: '3rem', color: '#ef4444', display: 'block', marginBottom: '1rem' }} />
          <h2 style={{ color: 'var(--on-surface)', fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Access Denied</h2>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '1.5rem', fontFamily: 'var(--font-body)' }}>
            Your account does not have admin privileges. <br/>
            <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>UID: {currentUser?.uid}</span>
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button onClick={() => navigate('/')} style={{ padding: '0.75rem 1.5rem', background: 'var(--surface-container-high)', color: 'var(--on-surface)', borderRadius: '999px', fontWeight: 800, border: 'none', cursor: 'pointer' }}>Return Home</button>
            <button 
              onClick={async () => {
                const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
                const { db } = await import('../firebase');
                await setDoc(doc(db, 'users', currentUser.uid), { role: 'admin', updatedAt: serverTimestamp() }, { merge: true });
                alert('Success! Please refresh the page.');
                window.location.reload();
              }} 
              style={{ padding: '0.75rem 1.5rem', background: 'var(--gradient-primary)', color: 'white', borderRadius: '999px', fontWeight: 800, border: 'none', cursor: 'pointer' }}
            >
              Regain Admin Access
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Derived data ─────────────────────────────────────────────────────────
  const filteredBookings = bookingFilter === 'all'
    ? allBookings
    : allBookings.filter(b => b.status === bookingFilter);

  const pendingCount = allBookings.filter(b => b.status === 'pending').length;

  const stats = [
    { label: 'Total Bookings', value: allBookings.length, icon: 'ph-calendar-check', color: '#3b82f6' },
    { label: 'Pending', value: allBookings.filter(b => b.status === 'pending').length, icon: 'ph-clock', color: '#f59e0b' },
    { label: 'Completed', value: allBookings.filter(b => b.status === 'completed').length, icon: 'ph-seal-check', color: '#22c55e' },
    { label: 'Offers Live', value: serviceOffers.filter(o => o.active).length, icon: 'ph-megaphone', color: '#a855f7' },
  ];

  // ─── Settings save ─────────────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    await updateSettings(telegramForm);
    setSavingSettings(false);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 3000);
  };

  const handleTestTelegram = async () => {
    if (!telegramForm.telegramBotToken || !telegramForm.telegramAdminChatId) {
      setTelegramTestResult({ ok: false, msg: 'Add Bot Token and Admin Chat ID first.' });
      return;
    }
    setTestingTelegram(true);
    setTelegramTestResult(null);
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${telegramForm.telegramBotToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramForm.telegramAdminChatId,
            text: '✅ *Patna Suvidha Telegram Test*\n\nBot is connected and working!',
            parse_mode: 'Markdown',
          }),
        }
      );
      const data = await res.json();
      setTelegramTestResult(data.ok
        ? { ok: true, msg: 'Test message sent successfully!' }
        : { ok: false, msg: data.description || 'Failed to send.' }
      );
    } catch (e) {
      setTelegramTestResult({ ok: false, msg: 'Network error. Check bot token.' });
    }
    setTestingTelegram(false);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)', display: 'flex', flexDirection: 'column' }}>
      {/* Premium Admin Header */}
      <header className="glass-nav" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--outline-variant)', padding: '0.75rem 1.5rem' }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)' }}>
              <i className="ph-fill ph-shield-check" style={{ color: '#fff', fontSize: '1.5rem' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.125rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Terminal</h1>
              <p style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--on-surface-variant)' }}>PATNA SUVIDHA • PRODUCTION V2</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <StatusBadge status={bookingsEnabled ? 'confirmed' : 'cancelled'} />
             <div style={{ height: '32px', width: '1px', background: 'var(--outline-variant)' }} />
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <div style={{ textAlign: 'right' }}>
                 <p style={{ fontSize: '0.75rem', fontWeight: 800 }}>{currentUser.displayName || 'Admin'}</p>
                 <button onClick={() => navigate('/')} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontSize: '0.625rem', fontWeight: 900, cursor: 'pointer', padding: 0 }}>VIEW SITE</button>
               </div>
               <img src={currentUser.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--primary)' }} alt="Admin" />
             </div>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Analytics Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {[
            { label: 'Active Bookings', value: stats.pending, icon: 'ph-clock-counter-clockwise', color: 'var(--primary)' },
            { label: 'Completed Jobs', value: stats.completed, icon: 'ph-seal-check', color: 'var(--secondary)' },
            { label: 'Total Revenue', value: stats.revenue ? `₹${stats.revenue.toLocaleString('en-IN')}` : '₹0', icon: 'ph-currency-inr', color: 'var(--secondary)' },
            { label: 'Total Providers', value: stats.providers, icon: 'ph-users-three', color: '#a855f7' }
          ].map((s, i) => (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="clay-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${s.color}15`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <i className={`ph-fill ${s.icon}`} style={{ color: s.color, fontSize: '1.5rem' }} />
              </div>
              <div>
                <p style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>{s.label}</p>
                <p style={{ fontSize: '1.375rem', fontWeight: 900, fontFamily: 'var(--font-display)' }}>{s.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="hide-scrollbar" style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', marginBottom: '2rem', paddingBottom: '0.5rem' }}>
          <TabBtn id="tab-bookings" label="Bookings" icon="ph-calendar-check" active={tab === 'bookings'} onClick={() => setTab('bookings')} badge={stats.pending} />
          <TabBtn id="tab-services" label="Service Master" icon="ph-gear-six" active={tab === 'services'} onClick={() => setTab('services')} />
          <TabBtn id="tab-providers" label="Providers" icon="ph-users-three" active={tab === 'providers'} onClick={() => setTab('providers')} />
          <TabBtn id="tab-offers" label="Offers" icon="ph-megaphone" active={tab === 'offers'} onClick={() => setTab('offers')} />
          <TabBtn id="tab-notifs" label="Broadcast" icon="ph-broadcast" active={tab === 'notifs'} onClick={() => setTab('notifs')} />
          <TabBtn id="tab-settings" label="System" icon="ph-gear-six" active={tab === 'settings'} onClick={() => setTab('settings')} />
        </div>

        {/* Tab Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            style={{ minHeight: '600px' }}
          >
            {tab === 'bookings' && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                   <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }} className="hide-scrollbar">
                      {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
                        <button key={f} onClick={() => setBookingFilter(f)} style={{ padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', background: bookingFilter === f ? 'var(--primary)' : 'var(--surface-container-high)', color: bookingFilter === f ? '#fff' : 'var(--on-surface-variant)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>{f}</button>
                      ))}
                   </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                  {(allBookings || [])
                    .filter(b => bookingFilter === 'all' || b.status === bookingFilter)
                    .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((b, i) => (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={b.id} className="clay-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setSelectedBooking(b)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--surface-container-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             <i className={`ph-fill ${STATUS_CONFIG[b.status]?.icon || 'ph-question'}`} style={{ color: STATUS_CONFIG[b.status]?.color || 'var(--primary)', fontSize: '1.25rem' }} />
                          </div>
                          <div>
                            <p style={{ fontWeight: 900, fontSize: '1rem' }}>{b.service}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 700 }}>{b.customerName || 'Customer'} • {b.date} • {b.time}</p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <StatusBadge status={b.status} />
                          <p style={{ fontSize: '0.875rem', fontWeight: 900, marginTop: '0.25rem', color: 'var(--primary)' }}>₹{b.amount || '0'}</p>
                        </div>
                      </motion.div>
                    ))}
                  {allBookings?.length === 0 && (
                    <div className="clay-card" style={{ padding: '4rem', textAlign: 'center' }}>
                       <i className="ph-fill ph-ghost" style={{ fontSize: '3rem', opacity: 0.2, marginBottom: '1rem', display: 'block' }} />
                       <p style={{ fontWeight: 800, color: 'var(--on-surface-variant)' }}>No bookings found.</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {tab === 'services' && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900 }}>Category Master</h3>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={handleSeedCategories} disabled={seeding} className="btn-secondary" style={{ padding: '0.625rem 1rem', fontSize: '0.75rem' }}>
                      {seeding ? 'Seeding...' : 'Seed Data'}
                    </button>
                    <button onClick={() => setCategoryModal('new')} className="btn-primary" style={{ padding: '0.625rem 1rem', fontSize: '0.75rem' }}>
                      + New Category
                    </button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {categories.map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="clay-card" style={{ padding: '1.125rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <i className={`ph-fill ${c.icon || 'ph-gear'}`} style={{ fontSize: '1.5rem', color: 'var(--primary)' }} />
                       </div>
                       <div style={{ flex: 1 }}>
                         <p style={{ fontWeight: 900, fontSize: '1rem' }}>{c.name}</p>
                         <p style={{ fontSize: '0.6875rem', color: 'var(--on-surface-variant)', fontWeight: 700, textTransform: 'uppercase' }}>{c.services?.length || 0} Sub-services</p>
                       </div>
                       <button onClick={() => setCategoryModal(c)} className="btn-icon">
                          <i className="ph-fill ph-pencil-simple" />
                       </button>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {tab === 'providers' && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900 }}>Service Providers</h3>
                  <button onClick={() => setBusinessModal('new')} className="btn-primary" style={{ padding: '0.625rem 1rem', fontSize: '0.75rem' }}>+ Add Provider</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                  {providers.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }} className="clay-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <i className="ph-fill ph-user-circle-gear" style={{ fontSize: '1.5rem', color: 'var(--secondary)' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 900, fontSize: '1rem' }}>{p.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 700 }}>{p.category} • {p.phone}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => setBusinessModal(p)} className="btn-icon"><i className="ph-fill ph-pencil" /></button>
                        <button onClick={() => deleteBusiness(p.id)} className="btn-icon" style={{ background: 'var(--error-container)', color: 'var(--error)' }}><i className="ph-fill ph-trash" /></button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {tab === 'offers' && (
              <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900 }}>Campaigns & Offers</h3>
                  <button onClick={() => setOfferModal('new')} className="btn-primary" style={{ padding: '0.625rem 1rem', fontSize: '0.75rem' }}>+ New Offer</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {serviceOffers.map((offer, i) => {
                    const g = Array.isArray(offer.gradient) ? offer.gradient : ['#ff8c00', '#ff4500'];
                    return (
                      <motion.div key={offer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="clay-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.15)', flexShrink: 0 }}>
                          <i className={`ph-fill ${offer.icon || 'ph-tag'}`} style={{ color: '#fff', fontSize: '1.75rem' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 900, fontSize: '1.125rem' }}>{offer.title}</p>
                          <p style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>{offer.subtitle}</p>
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                             <span style={{ fontSize: '0.625rem', fontWeight: 900, background: offer.active ? 'var(--secondary-container)' : 'var(--error-container)', color: offer.active ? 'var(--secondary)' : 'var(--error)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>{offer.active ? 'LIVE' : 'HIDDEN'}</span>
                             <span style={{ fontSize: '0.625rem', fontWeight: 900, background: 'var(--surface-container-high)', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>{offer.category}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <button onClick={() => setOfferModal(offer)} className="btn-icon"><i className="ph-fill ph-pencil" /></button>
                          <button onClick={() => deleteServiceOffer(offer.id)} className="btn-icon" style={{ background: 'var(--error-container)', color: 'var(--error)' }}><i className="ph-fill ph-trash" /></button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}

            {tab === 'settings' && (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 900 }}>System Control</h3>
                </div>

                {/* Global Availability */}
                <div className="clay-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                      <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface)' }}>System Status</p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>Master switch for all bookings</p>
                    </div>
                    <button
                      onClick={handleToggleAvailability}
                      style={{
                        width: '52px', height: '30px', borderRadius: '999px',
                        background: bookingsEnabled ? 'var(--primary)' : 'var(--surface-container-high)',
                        border: '1px solid var(--glass-border)', cursor: 'pointer', position: 'relative', transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                      }}
                    >
                      <div style={{
                        position: 'absolute', top: '2px',
                        left: bookingsEnabled ? '24px' : '2px',
                        width: '24px', height: '24px', borderRadius: '50%',
                        background: '#fff', transition: 'left 0.3s cubic-bezier(0.34,1.56,0.64,1)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      }} />
                    </button>
                  </div>

                  {/* Category Availability List */}
                  <div style={{ background: 'var(--surface-container-high)', borderRadius: '16px', padding: '1rem' }}>
                    <p style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--on-surface-variant)', letterSpacing: '0.08em', marginBottom: '1rem' }}>Operational Controls</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {CATEGORIES.filter(c => c.id !== 'all').map(cat => {
                        const isPaused = (settings.pausedCategories || []).includes(cat.id);
                        return (
                          <div key={cat.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                               <i className={`ph-fill ${cat.icon || 'ph-gear'}`} style={{ color: isPaused ? 'var(--on-surface-variant)' : 'var(--primary)', opacity: isPaused ? 0.3 : 1 }} />
                               <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: isPaused ? 'var(--on-surface-variant)' : 'var(--on-surface)' }}>{cat.name}</span>
                            </div>
                            <button
                              onClick={() => updateCategoryAvailability(cat.id, isPaused)}
                              style={{
                                padding: '0.375rem 0.75rem', borderRadius: '10px',
                                background: isPaused ? 'hsla(0, 72%, 51%, 0.1)' : 'hsla(142, 76%, 36%, 0.1)',
                                color: isPaused ? 'var(--error)' : 'var(--secondary)',
                                border: `1px solid ${isPaused ? 'var(--error)' : 'var(--secondary)'}30`,
                                fontSize: '0.6875rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s'
                              }}
                            >
                              {isPaused ? 'RESUME' : 'PAUSE'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

            {/* Push Notifications */}
            <div className="clay-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ph-fill ph-bell-ringing" style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface)' }}>Internal Push</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>Send alerts to user Updates center</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <input
                  className="input-field"
                  placeholder="Notification Title"
                  value={notifForm.title}
                  onChange={e => setNotifForm({ ...notifForm, title: e.target.value })}
                />
                <input
                  className="input-field"
                  placeholder="Subtitle (Optional details)"
                  value={notifForm.subtitle}
                  onChange={e => setNotifForm({ ...notifForm, subtitle: e.target.value })}
                />
                <button
                  onClick={handleSendNotification}
                  disabled={sendingNotif || !notifForm.title}
                  className="clay-btn"
                  style={{
                    padding: '0.875rem', borderRadius: '14px', background: 'var(--primary-container)',
                    color: 'var(--primary)', border: '1px solid var(--primary)', fontWeight: 800,
                    cursor: notifForm.title ? 'pointer' : 'not-allowed', opacity: notifForm.title ? 1 : 0.5
                  }}
                >
                  {sendingNotif ? 'Sending...' : 'Send Broadcast Alert'}
                </button>
              </div>
            </div>

            {/* Telegram card */}
            <div className="clay-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(0,136,204,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="ph-fill ph-telegram-logo" style={{ color: '#29aee6', fontSize: '1.5rem' }} />
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800, color: 'var(--on-surface)' }}>Telegram API</p>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>Sync bookings to Telegram groups</p>
                </div>
              </div>

              {/* How-to guide */}
              <div style={{ background: 'rgba(41,174,230,0.08)', border: '1px solid rgba(41,174,230,0.2)', borderRadius: '16px', padding: '1rem', marginBottom: '1.5rem' }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', fontWeight: 900, color: '#29aee6', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📋 Setup Guide</p>
                <ol style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--on-surface-variant)', paddingLeft: '1.125rem', lineHeight: 1.7, margin: 0, fontWeight: 600 }}>
                  <li>Search <strong style={{ color: '#29aee6' }}>@BotFather</strong> on Telegram → /newbot → copy token</li>
                  <li>Search <strong style={{ color: '#29aee6' }}>@userinfobot</strong> → /start → copy your Chat ID</li>
                  <li>Start your bot first (send /start to it) before testing</li>
                </ol>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { key: 'telegramBotToken', label: 'Bot Token', ph: '1234567890:AAFxxx...', type: 'password' },
                  { key: 'telegramAdminChatId', label: 'Admin Chat ID', ph: '123456789', type: 'text' },
                  { key: 'telegramCustomChatId', label: 'Custom Chat ID', ph: '987654321', type: 'text' },
                  { key: 'telegramCustomName', label: 'Custom Person Name', ph: 'Coordinator', type: 'text' },
                  { key: 'razorpayKey', label: 'Razorpay Key (LIVE)', ph: 'rzp_live_xxx', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.6875rem', fontWeight: 800, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {f.label}
                    </label>
                    <input
                      id={`settings-${f.key}`}
                      type={f.type}
                      className="input-field"
                      value={telegramForm[f.key]}
                      onChange={e => setTelegramForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.ph}
                    />
                  </div>
                ))}
              </div>

              {/* Test button */}
              <button
                id="test-telegram-btn"
                onClick={handleTestTelegram}
                disabled={testingTelegram}
                style={{
                  width: '100%', marginTop: '1rem', padding: '0.75rem',
                  borderRadius: '12px', background: 'rgba(41,174,230,0.12)',
                  border: '1px solid rgba(41,174,230,0.3)',
                  color: '#29aee6', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                }}
              >
                {testingTelegram
                  ? <><div style={{ width: '14px', height: '14px', border: '2px solid rgba(41,174,230,0.3)', borderTopColor: '#29aee6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Testing...</>
                  : <><i className="ph-fill ph-paper-plane-tilt" />Send Test Message</>
                }
              </button>

              {telegramTestResult && (
                <div style={{
                  marginTop: '0.625rem', padding: '0.625rem 0.875rem', borderRadius: '10px',
                  background: telegramTestResult.ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                  border: `1px solid ${telegramTestResult.ok ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                  fontSize: '0.75rem', fontWeight: 700,
                  color: telegramTestResult.ok ? '#22c55e' : '#ef4444',
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                }}>
                  <i className={`ph-fill ${telegramTestResult.ok ? 'ph-check-circle' : 'ph-warning-circle'}`} />
                  {telegramTestResult.msg}
                </div>
              )}
            </div>

            {/* Save button */}
            <button
              id="save-settings-btn"
              onClick={handleSaveSettings}
              disabled={savingSettings}
              style={{
                width: '100%', padding: '1rem', borderRadius: '16px',
                fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 800,
                background: settingsSaved ? 'rgba(34,197,94,0.15)' : 'var(--gradient-primary)',
                color: settingsSaved ? '#22c55e' : 'var(--on-primary)',
                border: settingsSaved ? '1px solid rgba(34,197,94,0.4)' : 'none',
                cursor: 'pointer', transition: 'all 0.3s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              {savingSettings
                ? <><div style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Saving...</>
                : settingsSaved
                  ? <><i className="ph-fill ph-check-circle" />Settings Saved!</>
                  : <><i className="ph-fill ph-floppy-disk" />Save Settings</>
              }
            </button>
          </div>
        )}

        {/* ─── Advanced Operations (Seed) ─── */}
        {tab === 'settings' && (
          <div className="animate-fade-in" style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'var(--surface-container-highest)', borderRadius: '24px', border: '1px dashed var(--outline-variant)' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>Danger Zone / System Init</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginBottom: '1.25rem' }}>
              Restore high-fidelity default categories, landing pages, and service plan metadata. 
              <br/><strong style={{color: 'var(--error)'}}>Warning: This will overwrite existing category metadata.</strong>
            </p>
            <button
              id="seed-btn"
              onClick={async () => {
                if (!window.confirm("Seed default high-fidelity category data? This overwrites existing categories.")) return;
                setSeeding(true);
                try {
                  for (const [id, data] of Object.entries(SEED_DATA)) {
                    await updateCategory(id, { ...data, id });
                  }
                  toast.success("Database Seeded Successfully!");
                } catch (e) {
                  toast.error("Seeding failed");
                } finally {
                  setSeeding(false);
                }
              }}
              disabled={seeding}
              style={{
                width: '100%', padding: '1rem', borderRadius: '16px',
                background: 'rgba(0,0,0,0.05)', color: 'var(--on-surface)',
                border: '1px solid var(--outline-variant)', fontWeight: 800, cursor: 'pointer'
              }}
            >
              {seeding ? 'Seeding Database...' : 'Restore Default Categories & Services'}
            </button>
          </div>
        )}

      </div>

      {/* Category Master Modal */}
      {categoryModal && (
        <CategoryFormModal
          category={categoryModal === 'new' ? null : categoryModal}
          onClose={() => setCategoryModal(null)}
          onSave={async (form) => {
            if (categoryModal === 'new') {
              await addCategory(form);
            } else {
              await updateCategory(categoryModal.id, form);
            }
          }}
        />
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          providers={providers}
          allBookings={allBookings}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={updateBookingStatus}
        />
      )}

      {/* Offer Form Modal */}
      {offerModal && (
        <OfferFormModal
          offer={offerModal === 'new' ? null : offerModal}
          onClose={() => setOfferModal(null)}
          onSave={async (form) => {
            if (offerModal === 'new') {
              await addServiceOffer(form);
            } else {
              await updateServiceOffer(offerModal.id, form);
            }
          }}
        />
      )}

      {/* Business Form Modal */}
      {businessModal && (
        <BusinessFormModal
          business={businessModal === 'new' ? null : businessModal}
          onClose={() => setBusinessModal(null)}
          onSave={async (form) => {
            if (businessModal === 'new') {
              await addBusiness(form);
            } else {
              await updateBusiness(businessModal.id, form);
            }
          }}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

// ─── CATEGORY FORM MODAL ───────────────────────────────────────────────────
function CategoryFormModal({ category, onClose, onSave }) {
  const [form, setForm] = useState(category || {
    id: '', name: '', nameHi: '', icon: 'ph-gear',
    hero: 'https://images.unsplash.com/photo-1556742400-b5b7a512a36e?auto=format&fit=crop&w=1200&q=80',
    title: '', titleHi: '', desc: '', descHi: '',
    services: [], // Array of { name, price }
    features: [], // Array of { icon, title }
    faqs: [],     // Array of { q, a }
    reviews: [],  // Array of { user, rating, text, photo }
    stats: { rating: '4.9', bookings: '1k+', experience: '5+ Years' },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  // Helpers for Rich Sections
  const [newFeature, setNewFeature] = useState({ icon: 'ph-check-circle', title: '' });
  const [newFaq, setNewFaq] = useState({ q: '', a: '' });
  const [newReview, setNewReview] = useState({ user: '', rating: 5, text: '' });

  const addListItem = (key, item, setter) => {
    if (!item.title && !item.q && !item.user) return;
    setForm(p => ({ ...p, [key]: [...(p[key] || []), item] }));
    setter(key === 'features' ? { icon: 'ph-check-circle', title: '' } : key === 'faqs' ? { q: '', a: '' } : { user: '', rating: 5, text: '' });
  };

  const removeListItem = (key, idx) => {
    setForm(p => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));
  };

  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    setForm(p => ({
      ...p,
      services: [...(p.services || []), { name: newServiceName.trim(), price: Number(newServicePrice) || 0 }]
    }));
    setNewServiceName('');
    setNewServicePrice('');
  };

  const removeService = (idx) => {
    setForm(p => ({
      ...p,
      services: p.services.filter((_, i) => i !== idx)
    }));
  };

  const handleSave = async () => {
    if (!form.id || !form.name) return toast.error("ID and Name are required");
    setIsSaving(true);
    try {
      await onSave(form);
      toast.success("Category saved!");
      onClose();
    } catch (e) {
      toast.error("Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
      <div className="clay-card animate-slide-up" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', background: 'var(--surface)' }}>
        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>{category ? 'Edit Category' : 'New Category'}</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '0.25rem' }}>CATEGORY ID (Slug)</label>
            <input className="input-field" value={form.id} onChange={e => setForm(p=>({...p, id: e.target.value.toLowerCase().replace(/\s+/g, '-')}))} disabled={!!category} placeholder="e.g. car-wash" />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '0.25rem' }}>DISPLAY NAME (EN)</label>
            <input className="input-field" value={form.name} onChange={e => setForm(p=>({...p, name: e.target.value}))} placeholder="e.g. Car Wash" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '0.25rem' }}>NAME (HI)</label>
            <input className="input-field" value={form.nameHi} onChange={e => setForm(p=>({...p, nameHi: e.target.value}))} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '0.25rem' }}>ICON (Phosphor name)</label>
            <input className="input-field" value={form.icon} onChange={e => setForm(p=>({...p, icon: e.target.value}))} />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface-container)', borderRadius: '12px' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem' }}>Hero & Marketing</h4>
          <label style={{ fontSize: '0.625rem', fontWeight: 800, display: 'block' }}>HERO IMAGE URL</label>
          <input className="input-field" style={{marginBottom: '0.75rem'}} value={form.hero} onChange={e => setForm(p=>({...p, hero: e.target.value}))} />
          
          <label style={{ fontSize: '0.625rem', fontWeight: 800, display: 'block' }}>HERO TITLE (EN/HI)</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input className="input-field" value={form.title} onChange={e => setForm(p=>({...p, title: e.target.value}))} placeholder="Professional Car Washing" />
            <input className="input-field" value={form.titleHi} onChange={e => setForm(p=>({...p, titleHi: e.target.value}))} placeholder="प्रोफेशनल कार वॉशिंग" />
          </div>

          <label style={{ fontSize: '0.625rem', fontWeight: 800, display: 'block' }}>DESCRIPTION (EN/HI)</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <textarea className="input-field" style={{ minHeight: '60px' }} value={form.desc} onChange={e => setForm(p=>({...p, desc: e.target.value}))} placeholder="English description..." />
            <textarea className="input-field" style={{ minHeight: '60px' }} value={form.descHi} onChange={e => setForm(p=>({...p, descHi: e.target.value}))} placeholder="Hindi description..." />
          </div>
        </div>
        
        {/* Sub-Services / Plans Management */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface-container)', borderRadius: '12px', border: '1px solid hsla(var(--p-h), 100%, 50%, 0.1)' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--primary)' }}>Service Menu (Plans & Pricing)</h4>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <input className="input-field" style={{flex: 3}} placeholder="Service Name (e.g. Tap Repair)" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} />
            <input className="input-field" style={{flex: 1}} type="number" placeholder="Price" value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} />
            <button onClick={handleAddService} style={{ padding: '0.75rem 1.25rem', background: 'var(--secondary)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800 }}>Add</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {form.services?.map((s, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--outline-variant)' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>{s.name}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800 }}>₹{s.price}</p>
                </div>
                <button onClick={() => removeService(i)} style={{ border: 'none', background: 'transparent', color: 'var(--error)', cursor: 'pointer' }}><i className="ph-fill ph-trash" /></button>
              </div>
            ))}
            {(!form.services || form.services.length === 0) && (
              <p style={{ fontSize: '0.75rem', opacity: 0.5, textAlign: 'center', padding: '1rem' }}>No service options added yet.</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface-container)', borderRadius: '12px' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem' }}>Platform Stats</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div>
              <label style={{ fontSize: '0.625rem', fontWeight: 800 }}>RATING</label>
              <input className="input-field" value={form.stats?.rating} onChange={e => setForm(p=>({...p, stats: {...p.stats, rating: e.target.value}}))} />
            </div>
            <div>
              <label style={{ fontSize: '0.625rem', fontWeight: 800 }}>BOOKINGS</label>
              <input className="input-field" value={form.stats?.bookings} onChange={e => setForm(p=>({...p, stats: {...p.stats, bookings: e.target.value}}))} />
            </div>
            <div>
              <label style={{ fontSize: '0.625rem', fontWeight: 800 }}>EXPERIENCE</label>
              <input className="input-field" value={form.stats?.experience} onChange={e => setForm(p=>({...p, stats: {...p.stats, experience: e.target.value}}))} />
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem' }}>Key Features / What's Included</h4>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input className="input-field" style={{flex: 1}} placeholder="Icon (ph-check)" value={newFeature.icon} onChange={e => setNewFeature(p=>({...p, icon: e.target.value}))} />
            <input className="input-field" style={{flex: 3}} placeholder="Feature Title" value={newFeature.title} onChange={e => setNewFeature(p=>({...p, title: e.target.value}))} />
            <button onClick={() => addListItem('features', newFeature, setNewFeature)} style={{ padding: '0 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px' }}>Add</button>
          </div>
          {form.features?.map((f, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--surface-container)', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.25rem' }}>
              <span><i className={f.icon} /> {f.title}</span>
              <button onClick={() => removeListItem('features', i)} style={{ border: 'none', background: 'transparent', color: '#ef4444' }}><i className="ph-fill ph-x-circle" /></button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem' }}>FAQs</h4>
          <input className="input-field" style={{marginBottom: '0.5rem'}} placeholder="Question" value={newFaq.q} onChange={e => setNewFaq(p=>({...p, q: e.target.value}))} />
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <textarea className="input-field" placeholder="Answer" value={newFaq.a} onChange={e => setNewFaq(p=>({...p, a: e.target.value}))} />
            <button onClick={() => addListItem('faqs', newFaq, setNewFaq)} style={{ padding: '0 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px' }}>Add</button>
          </div>
          {form.faqs?.map((f, i) => (
            <div key={i} style={{ background: 'var(--surface-container)', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>Q: {f.q}</span> <button onClick={() => removeListItem('faqs', i)} style={{ border: 'none', background: 'transparent', color: '#ef4444' }}><i className="ph-fill ph-x-circle" /></button></div>
              <p style={{ fontSize: '0.75rem' }}>A: {f.a}</p>
            </div>
          ))}
        </div>

        {/* Reviews */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem' }}>Customer Reviews (Feedback)</h4>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input className="input-field" style={{flex: 2}} placeholder="User Name" value={newReview.user} onChange={e => setNewReview(p=>({...p, user: e.target.value}))} />
            <input className="input-field" style={{flex: 1}} type="number" max="5" min="1" placeholder="Rating" value={newReview.rating} onChange={e => setNewReview(p=>({...p, rating: Number(e.target.value)}))} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <textarea className="input-field" placeholder="Review Text" value={newReview.text} onChange={e => setNewReview(p=>({...p, text: e.target.value}))} />
            <button onClick={() => addListItem('reviews', newReview, setNewReview)} style={{ padding: '0 1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px' }}>Add</button>
          </div>
          {form.reviews?.map((r, i) => (
            <div key={i} style={{ background: 'var(--surface-container)', padding: '0.5rem 0.75rem', borderRadius: '8px', marginBottom: '0.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}><span>{r.user} ({r.rating}★)</span> <button onClick={() => removeListItem('reviews', i)} style={{ border: 'none', background: 'transparent', color: '#ef4444' }}><i className="ph-fill ph-x-circle" /></button></div>
              <p style={{ fontSize: '0.75rem' }}>"{r.text}"</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--outline-variant)', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={isSaving} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', border: 'none', background: 'var(--gradient-primary)', color: 'white', fontWeight: 800, cursor: 'pointer' }}>
            {isSaving ? 'Saving...' : 'Save Category'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING DETAIL MODAL ──────────────────────────────────────────────────
function BookingDetailModal({ booking, providers, onClose, onStatusChange }) {
  const [updating, setUpdating] = useState(false);
  const currentStatus = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;

  const handleUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await onStatusChange(booking.id, newStatus);
      toast.success(`Booking ${newStatus}!`);
      onClose();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="clay-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', border: 'none', background: 'var(--surface-container-high)', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer' }}>
           <i className="ph-bold ph-x" style={{ color: 'var(--on-surface-variant)' }} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${currentStatus.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className={`ph-fill ${currentStatus.icon}`} style={{ color: currentStatus.color, fontSize: '2rem' }} />
          </div>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 900 }}>{booking.service}</h2>
            <StatusBadge status={booking.status} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
          <div>
            <p style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Customer</p>
            <p style={{ fontWeight: 800 }}>{booking.customerName || 'Walk-in'}</p>
            <p style={{ fontSize: '0.8125rem', opacity: 0.6 }}>{booking.phone}</p>
          </div>
          <div>
            <p style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Appointment</p>
            <p style={{ fontWeight: 800 }}>{booking.date}</p>
            <p style={{ fontSize: '0.8125rem', opacity: 0.6 }}>{booking.time}</p>
          </div>
        </div>

        {booking.address && (
          <div style={{ padding: '1.25rem', background: 'var(--surface-container-high)', borderRadius: '16px', marginBottom: '2rem' }}>
            <p style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Location</p>
            <p style={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.5 }}>{booking.address}</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           {booking.status === 'pending' && (
             <button onClick={() => handleUpdate('confirmed')} disabled={updating} className="btn-primary" style={{ padding: '1rem' }}>Confirm Booking</button>
           )}
           {(booking.status === 'confirmed' || booking.status === 'payment_initiated') && (
             <button onClick={() => handleUpdate('completed')} disabled={updating} className="btn-primary" style={{ padding: '1rem', background: 'var(--secondary-container)', color: 'var(--secondary)' }}>Mark as Completed</button>
           )}
           {booking.status !== 'cancelled' && booking.status !== 'completed' && (
             <button onClick={() => handleUpdate('cancelled')} disabled={updating} style={{ background: 'transparent', color: 'var(--error)', border: 'none', fontWeight: 800, cursor: 'pointer', padding: '0.5rem' }}>Cancel Service</button>
           )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── OFFER FORM MODAL ──────────────────────────────────────────────────────
function OfferFormModal({ offer, onClose, onSave }) {
  const [form, setForm] = useState(offer || { title: '', subtitle: '', icon: 'ph-star', category: 'General', active: true, gradient: GRADIENT_PRESETS[0] });
  const [saving, setSaving] = useState(false);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="clay-card" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>{offer ? 'Edit Campaign' : 'New Campaign'}</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <input className="input-field" placeholder="Title (e.g. 20% OFF)" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
           <input className="input-field" placeholder="Subtitle" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})} />
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
             <input className="input-field" placeholder="Icon (ph-star)" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} />
             <input className="input-field" placeholder="Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
           </div>
           
           <div>
             <label style={{ fontSize: '0.625rem', fontWeight: 900, marginBottom: '0.75rem', display: 'block' }}>STYLE PRESET</label>
             <div style={{ display: 'flex', gap: '0.5rem' }}>
               {GRADIENT_PRESETS.map((g, i) => (
                 <button key={i} onClick={() => setForm({...form, gradient: g})} style={{ width: '32px', height: '32px', borderRadius: '8px', background: `linear-gradient(135deg, ${g[0]}, ${g[1]})`, border: form.gradient === g ? '2px solid #fff' : 'none', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
               ))}
             </div>
           </div>

           <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
             <button onClick={onClose} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--outline-variant)', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
             <button onClick={async () => { setSaving(true); await onSave(form); setSaving(false); onClose(); }} className="btn-primary" style={{ flex: 1 }}>{saving ? 'Saving...' : 'Save'}</button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── BUSINESS/PROVIDER FORM MODAL ──────────────────────────────────────────
function BusinessFormModal({ business, onClose, onSave }) {
  const [form, setForm] = useState(business || { name: '', phone: '', category: 'Plumber', active: true });
  const [saving, setSaving] = useState(false);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="clay-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.5rem' }}>{business ? 'Edit Provider' : 'Add Provider'}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <input className="input-field" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
           <input className="input-field" placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
           <input className="input-field" placeholder="Primary Category" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
           
           <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
             <button onClick={onClose} style={{ flex: 1, padding: '0.875rem', borderRadius: '12px', border: '1px solid var(--outline-variant)', background: 'transparent', cursor: 'pointer' }}>Cancel</button>
             <button onClick={async () => { setSaving(true); await onSave(form); setSaving(false); onClose(); }} className="btn-primary" style={{ flex: 1 }}>{saving ? 'Saving...' : 'Save'}</button>
           </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── SHARED UTILITIES ──────────────────────────────────────────────────────
function TabBtn({ label, icon, active, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, padding: '0.75rem 1.25rem', borderRadius: '14px',
        display: 'flex', alignItems: 'center', gap: '0.625rem',
        background: active ? 'var(--primary-container)' : 'var(--surface-container-high)',
        color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
        border: active ? '1px solid var(--primary)' : '1px solid transparent',
        fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '0.875rem',
        cursor: 'pointer', transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <i className={`ph-fill ${icon}`} />
      <span>{label}</span>
      {badge > 0 && (
        <span style={{ fontSize: '0.625rem', background: 'var(--primary)', color: '#fff', minWidth: '18px', height: '18px', padding: '0 4px', borderRadius: '99px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {badge}
        </span>
      )}
    </button>
  );
}

function StatusBadge({ status }) {
  const conf = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
      padding: '0.25rem 0.625rem', borderRadius: '999px',
      background: conf.bg, color: conf.color,
      fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em'
    }}>
      <i className={`ph-fill ${conf.icon}`} style={{ fontSize: '0.75rem' }} />
      {conf.label}
    </span>
  );
}

function CategoryFormModal({ category, onClose, onSave }) {
  const [form, setForm] = useState(category || {
    id: '', name: '', nameHi: '', icon: 'ph-gear',
    hero: 'https://images.unsplash.com/photo-1556742400-b5b7a512a36e?auto=format&fit=crop&w=1200&q=80',
    title: '', titleHi: '', desc: '', descHi: '',
    services: [], // Array of { name, price }
    features: [], // Array of { icon, title }
    faqs: [],     // Array of { q, a }
    reviews: [],  // Array of { user, rating, text, photo }
    stats: { rating: '4.9', bookings: '1k+', experience: '5+ Years' },
  });
  const [isSaving, setIsSaving] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  // Helpers for Rich Sections
  const [newFeature, setNewFeature] = useState({ icon: 'ph-check-circle', title: '' });
  const [newFaq, setNewFaq] = useState({ q: '', a: '' });
  const [newReview, setNewReview] = useState({ user: '', rating: 5, text: '' });

  const addListItem = (key, item, setter) => {
    if (!item.title && !item.q && !item.user) return;
    setForm(p => ({ ...p, [key]: [...(p[key] || []), item] }));
    setter(key === 'features' ? { icon: 'ph-check-circle', title: '' } : key === 'faqs' ? { q: '', a: '' } : { user: '', rating: 5, text: '' });
  };

  const removeListItem = (key, idx) => {
    setForm(p => ({ ...p, [key]: p[key].filter((_, i) => i !== idx) }));
  };

  const handleSave = async () => {
    if (!form.id || !form.name) return toast.error("ID and Name are required");
    setIsSaving(true);
    try {
      await onSave(form);
      setIsSaving(false);
      onClose();
    } catch (e) {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.25rem' }}>
      <div className="clay-card animate-slide-up" style={{ width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', background: 'var(--surface)' }}>
        <h2 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>{category ? 'Edit Category' : 'New Category'}</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '0.25rem' }}>CATEGORY ID (Slug)</label>
            <input className="input-field" value={form.id} onChange={e => setForm(p=>({...p, id: e.target.value.toLowerCase().replace(/\s+/g, '-')}))} disabled={!!category} placeholder="e.g. car-wash" />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '0.25rem' }}>DISPLAY NAME (EN)</label>
            <input className="input-field" value={form.name} onChange={e => setForm(p=>({...p, name: e.target.value}))} placeholder="e.g. Car Wash" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '0.25rem' }}>NAME (HI)</label>
            <input className="input-field" value={form.nameHi} onChange={e => setForm(p=>({...p, nameHi: e.target.value}))} />
          </div>
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '0.25rem' }}>ICON (Phosphor name)</label>
            <input className="input-field" value={form.icon} onChange={e => setForm(p=>({...p, icon: e.target.value}))} />
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface-container)', borderRadius: '12px' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem' }}>Hero & Marketing</h4>
          <input className="input-field" style={{marginBottom: '0.75rem'}} placeholder="Hero Image URL" value={form.hero} onChange={e => setForm(p=>({...p, hero: e.target.value}))} />
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input className="input-field" value={form.title} onChange={e => setForm(p=>({...p, title: e.target.value}))} placeholder="Title (EN)" />
            <input className="input-field" value={form.titleHi} onChange={e => setForm(p=>({...p, titleHi: e.target.value}))} placeholder="Title (HI)" />
          </div>
        </div>

        {/* Stats */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface-container)', borderRadius: '12px' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem' }}>Platform Stats</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div><label style={{fontSize:'0.625rem',fontWeight:800}}>RATING</label><input className="input-field" value={form.stats?.rating} onChange={e => setForm(p=>({...p, stats: {...p.stats, rating: e.target.value}}))} /></div>
            <div><label style={{fontSize:'0.625rem',fontWeight:800}}>BOOKINGS</label><input className="input-field" value={form.stats?.bookings} onChange={e => setForm(p=>({...p, stats: {...p.stats, bookings: e.target.value}}))} /></div>
            <div><label style={{fontSize:'0.625rem',fontWeight:800}}>EXP</label><input className="input-field" value={form.stats?.experience} onChange={e => setForm(p=>({...p, stats: {...p.stats, experience: e.target.value}}))} /></div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '1rem', borderRadius: '14px', border: '1px solid var(--outline-variant)', background: 'transparent' }}>Cancel</button>
          <button onClick={handleSave} disabled={isSaving} className="btn-primary" style={{ flex: 1 }}>{isSaving ? 'Saving...' : 'Save Category'}</button>
        </div>
      </div>
    </div>
  );
}

