import React from 'react';

/**
 * AiLoading — Vietnamese-friendly inline AI loading indicator.
 */
const AiLoading = ({ text = 'Đang xử lý...' }) => (
  <div className="flex items-center gap-3 py-6">
    <span
      className="inline-block text-2xl text-green-600 animate-spin"
      style={{ animationDuration: '1.5s' }}
    >
      ✦
    </span>
    <span className="text-[15px] text-green-700 font-medium">{text}</span>
  </div>
);

export default AiLoading;
