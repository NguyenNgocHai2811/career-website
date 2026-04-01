const fs = require('fs');
const file = 'client/src/pages/Register/Register.jsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { useState }")) {
  content = content.replace("import React from 'react';", "import React, { useState } from 'react';");
}

if (!content.includes("const [role, setRole] = useState('candidate');")) {
  content = content.replace("function Register() {", "function Register() {\n  const [role, setRole] = useState('candidate');");
}

// Replace Candidate label
content = content.replace(
  '<label className="relative flex cursor-pointer rounded-lg border-2 border-primary bg-primary/5 p-4 focus:outline-none">',
  '<label \n                    className={`relative flex cursor-pointer rounded-lg border-2 p-4 focus:outline-none transition-all ${role === \\\'candidate\\\' ? \\\'border-primary bg-primary/5\\\' : \\\'border-[#d2d5e5] dark:border-white/10 bg-transparent hover:border-primary/50\\\'}`}\n                    onClick={() => setRole(\\\'candidate\\\')}\n                  >'
);

content = content.replace(
  '<input defaultChecked className="sr-only" name="role" type="radio" value="candidate" />',
  '<input checked={role === \\\'candidate\\\'} readOnly className="sr-only" name="role" type="radio" value="candidate" />'
);

content = content.replace(
  '<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">',
  '<div className={`flex h-10 w-10 items-center justify-center rounded-lg ${role === \\\'candidate\\\' ? \\\'bg-primary text-white\\\' : \\\'bg-[#d2d5e5] dark:bg-white/10 text-[#545d92] dark:text-white\\\'}`}>'
);

content = content.replace(
  '<div className="text-primary">\n                        <span className="material-symbols-outlined text-lg">check_circle</span>\n                      </div>',
  '<div className={role === \\\'candidate\\\' ? \\\'text-primary\\\' : \\\'text-transparent\\\'}>\n                        <span className="material-symbols-outlined text-lg">check_circle</span>\n                      </div>'
);

// Replace Recruiter label
content = content.replace(
  '<label className="relative flex cursor-pointer rounded-lg border-2 border-[#d2d5e5] dark:border-white/10 bg-transparent p-4 focus:outline-none hover:border-primary/50 transition-all">',
  '<label \n                    className={`relative flex cursor-pointer rounded-lg border-2 p-4 focus:outline-none transition-all ${role === \\\'recruiter\\\' ? \\\'border-primary bg-primary/5\\\' : \\\'border-[#d2d5e5] dark:border-white/10 bg-transparent hover:border-primary/50\\\'}`}\n                    onClick={() => setRole(\\\'recruiter\\\')}\n                  >'
);

content = content.replace(
  '<input className="sr-only" name="role" type="radio" value="recruiter" />',
  '<input checked={role === \\\'recruiter\\\'} readOnly className="sr-only" name="role" type="radio" value="recruiter" />'
);

content = content.replace(
  '<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#d2d5e5] dark:bg-white/10 text-[#545d92] dark:text-white">',
  '<div className={`flex h-10 w-10 items-center justify-center rounded-lg ${role === \\\'recruiter\\\' ? \\\'bg-primary text-white\\\' : \\\'bg-[#d2d5e5] dark:bg-white/10 text-[#545d92] dark:text-white\\\'}`}>'
);

content = content.replace(
  '<div className="text-transparent">\n                        <span className="material-symbols-outlined text-lg">check_circle</span>\n                      </div>',
  '<div className={role === \\\'recruiter\\\' ? \\\'text-primary\\\' : \\\'text-transparent\\\'}>\n                        <span className="material-symbols-outlined text-lg">check_circle</span>\n                      </div>'
);

fs.writeFileSync(file, content);
