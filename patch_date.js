const fs = require('fs');
const file = 'client/src/pages/Register/Register.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace Date of Birth input and icon wrapper
content = content.replace(
  '<div className="flex items-stretch rounded-lg border border-[#d2d5e5] dark:border-white/10 bg-[#f9f9fb] dark:bg-white/5 focus-within:border-primary transition-all">\n                      <input className="flex-1 bg-transparent px-4 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white" type="date" />\n                      <div className="flex items-center pr-3 text-[#545d92]">\n                        <span className="material-symbols-outlined text-lg">calendar_today</span>\n                      </div>\n                    </div>',
  '<div className="relative flex items-stretch rounded-lg border border-[#d2d5e5] dark:border-white/10 bg-[#f9f9fb] dark:bg-white/5 focus-within:border-primary transition-all overflow-hidden">\n                      <input \n                        className="relative z-10 w-full bg-transparent px-4 py-2.5 outline-none text-sm text-[#0f111a] dark:text-white [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer bg-transparent"\n                        type="date" \n                      />\n                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center text-[#545d92] pointer-events-none z-0">\n                        <span className="material-symbols-outlined text-lg">calendar_today</span>\n                      </div>\n                    </div>'
);

fs.writeFileSync(file, content);
