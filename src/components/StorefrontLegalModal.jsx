import React from 'react';

const StorefrontLegalModal = ({ title, businessName, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-[32px] border border-[#e6dfd1] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-6 border-b border-[#efe8dc] px-8 py-6">
          <div>
            <div className="text-[11px] font-black uppercase tracking-[0.2em] text-[#8b6b2f]">Storefront Legal</div>
            <h3 className="mt-2 text-3xl font-black text-[#183126]">{title}</h3>
            <p className="mt-2 text-sm font-medium text-[#5f6c65]">
              This policy applies to customer interactions with {businessName} through the Poultry Central storefront.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e6dfd1] text-2xl font-bold text-[#183126] transition hover:bg-[#fcfaf5]"
            aria-label="Close legal modal"
          >
            ×
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-8 py-6 text-sm leading-7 text-[#31453a]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default StorefrontLegalModal;
