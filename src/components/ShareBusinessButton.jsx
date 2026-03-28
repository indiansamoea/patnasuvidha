import React from 'react';

/**
 * ShareBusinessButton - Viral Growth Loop via WhatsApp & Native Share
 * @param {Object} business - The business data object
 * @returns {JSX.Element}
 */
export default function ShareBusinessButton({ business }) {
  const shareData = {
    title: business.name,
    text: `Looking for a ${business.category}? Check out ${business.name} on Patna Suvidha! 🚀`,
    url: window.location.href, // Or a specific business detail page URL like `${window.location.origin}/business/${business.id}`
  };

  const shareMessage = `प्रणाम! 🙏\n\nLooking for a *${business.category}*? Check out *${business.name}* on Patna Suvidha! 🚀\n\nClick here: ${window.location.href}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: WhatsApp API URL
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white transition-all rounded-xl hover:scale-105 active:scale-95"
      style={{
        backgroundColor: '#25D366',
        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
      }}
    >
      <i className="ph-fill ph-whatsapp-logo text-lg"></i>
      {/* <span>Share on WhatsApp</span> */}
      <span>WhatsApp Share</span>
    </button>
  );
}
