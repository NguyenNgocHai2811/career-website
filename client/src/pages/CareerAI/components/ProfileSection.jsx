import React from 'react';

/**
 * ProfileSection — left-pane block trong IdentityPhase.
 */
const ProfileSection = ({ icon, title, children }) => (
  <div className="mb-7">
    <div className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
      {icon && <span>{icon}</span>}
      <span>{title}</span>
    </div>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

export default ProfileSection;
