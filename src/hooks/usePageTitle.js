import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getCategoryById } from '../utils/categories';

const BASE_TITLE = 'Patna Suvidha';
const BASE_DESC = 'Patna Suvidha — Your Hyperlocal Elite Service Doorstep Platform. Book Plumbers, Electricians, Doctors, Beauty & 50+ services in Patna.';

export function usePageTitle() {
  const location = useLocation();
  const { category, id } = useParams();

  useEffect(() => {
    let title = BASE_TITLE;
    let desc = BASE_DESC;

    const path = location.pathname;

    if (path === '/') {
      title = `Patna Suvidha — Book Elite Local Services in Patna`;
      desc = `The most trusted service platform in Patna. Book verified experts for plumbing, electrical, health, and home needs.`;
    } else if (path === '/services') {
      title = `Browse Categories | ${BASE_TITLE}`;
      desc = `Explore over 50+ service categories available for immediate booking in Patna.`;
    } else if (path.startsWith('/service/')) {
      const cat = getCategoryById(category);
      if (cat) {
        const name = cat.name;
        title = `${name} Services in Patna | ${BASE_TITLE}`;
        desc = `Need a professional ${name.toLowerCase()} in Patna? Book verified specialists for ${name.toLowerCase()} services at your doorstep with 100% reliability.`;
      }
    } else if (path.startsWith('/book/')) {
      title = `Secure Booking | ${BASE_TITLE}`;
    } else if (path === '/bookings') {
      title = `My Service History | ${BASE_TITLE}`;
    } else if (path === '/account') {
      title = `Account & Support | ${BASE_TITLE}`;
    } else if (path === '/login') {
      title = `Login | ${BASE_TITLE}`;
    } else if (path === '/updates') {
      title = `Newsroom & Updates | ${BASE_TITLE}`;
    } else if (path === '/admin') {
      title = `Partner Control Center | ${BASE_TITLE}`;
    }

    document.title = title;

    // Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', desc);

    // Update OG Title
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    // Update OG Description
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);
    
  }, [location, category, id]);
}
