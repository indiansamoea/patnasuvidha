import { useRef } from 'react';
import imageCompression from 'browser-image-compression';

export default function ImageUpload({ value, onChange, label, style, multiple = false }) {
  const ref = useRef();

  const handleFile = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const validFiles = files.filter(f => f.size <= 5 * 1024 * 1024); // 5MB limit
    if (validFiles.length < files.length) {
      alert('Some images were ignored (must be under 5MB)');
    }

    const compressAndResolve = async (file) => {
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/webp'
      };
      try {
        const compressedFile = await imageCompression(file, options);
        // Create a preview URL but keep the file for upload
        const preview = URL.createObjectURL(compressedFile);
        return { file: compressedFile, preview };
      } catch (error) {
        console.error('Compression error:', error);
        return null;
      }
    };

    const readers = validFiles.map(file => compressAndResolve(file));

    Promise.all(readers).then(results => {
      if (multiple) {
        onChange([...(value || []), ...results]);
      } else {
        onChange(results[0]);
      }
    });

    // Reset input
    if (ref.current) ref.current.value = '';
  };

  const removeImage = (index) => {
    if (multiple) {
      const newVal = [...value];
      newVal.splice(index, 1);
      onChange(newVal);
    } else {
      onChange('');
    }
  };

  const images = multiple ? (value || []) : (value ? [value] : []);

  return (
    <div style={style}>
      {label && <label style={{ fontFamily: "'Manrope'", fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', display: 'block', marginBottom: '0.375rem' }}>{label}</label>}
      <input ref={ref} type="file" accept="image/*" multiple={multiple} onChange={handleFile} style={{ display: 'none' }} />
      
      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '0.5rem', marginBottom: '0.5rem' }}>
          {images.map((img, idx) => (
             <div key={idx} style={{ position: 'relative', borderRadius: '0.5rem', overflow: 'hidden', height: '80px', border: '1px solid var(--outline-variant)' }}>
                <img src={typeof img === 'string' ? img : img.preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImage(idx); }} style={{
                  position: 'absolute', top: '0.25rem', right: '0.25rem', background: 'rgba(0,0,0,0.6)', color: '#fff',
                  border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}>✕</button>
             </div>
          ))}
        </div>
      )}

      {(!multiple && images.length === 0) || (multiple) ? (
        <div
          onClick={() => ref.current?.click()}
          style={{
            width: '100%', minHeight: '80px', borderRadius: '0.75rem',
            background: 'var(--surface-container)', border: '2px dashed var(--outline-variant)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', overflow: 'hidden', padding: '1rem',
            transition: 'border-color 150ms',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--outline-variant)'}
        >
          <i className="ph-bold ph-camera" style={{ color: 'var(--on-surface-variant)', fontSize: '1.5rem', marginBottom: '0.375rem' }}></i>
          <span style={{ fontFamily: "'Manrope'", fontSize: '0.6875rem', color: 'var(--on-surface-variant)' }}>{multiple ? 'Add Photos' : 'Tap to upload photo'}</span>
          <span style={{ fontFamily: "'Manrope'", fontSize: '0.5625rem', color: 'var(--outline)' }}>Max 5MB • JPG, PNG</span>
        </div>
      ) : null}
    </div>
  );
}
