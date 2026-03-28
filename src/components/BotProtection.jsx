import React, { useEffect, useRef } from 'react';
import { Turnstile } from '@marsidev/react-turnstile';
import { useAppContext } from '../context/AppContext';

/**
 * BotProtection - Cloudflare Turnstile Invisible Widget
 */
export default function BotProtection() {
  const { setTurnstileToken } = useAppContext();
  const turnstileRef = useRef(null);

  const onSuccess = (token) => {
    // console.log('Turnstile Verified:', token);
    if (setTurnstileToken) {
      setTurnstileToken(token);
    }
    // Store token globally or in session to be used by critical actions
    sessionStorage.setItem('cf_turnstile_token', token);
  };

  const onError = (error) => {
    console.error('Turnstile Error:', error);
  };

  return (
    <div style={{ display: 'none' }}>
      <Turnstile
        ref={turnstileRef}
        siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACw2a6MzcEneQin7'}
        onSuccess={onSuccess}
        onError={onError}
        options={{
          appearance: 'always', // Or 'execute' for invisible but we'll hide it via CSS
          theme: 'auto',
          size: 'invisible',
        }}
      />
    </div>
  );
}
