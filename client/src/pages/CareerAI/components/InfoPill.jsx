import React from 'react';

/**
 * InfoPill — small label+value pill (used in DetailPhase Tổng quan).
 */
const InfoPill = ({ icon, label, value }) => (
  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-full">
    {icon && <span>{icon}</span>}
    <span className="text-[13px] text-slate-500">{label}:</span>
    <span className="text-[13px] font-bold text-slate-800">{value}</span>
  </div>
);

export default InfoPill;
