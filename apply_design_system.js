const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  // Fonts
  { regex: /font-\['Plus_Jakarta_Sans'\]/g, replacement: 'font-sans' },
  
  // Background Colors - primary accent
  { regex: /bg-\[#0F766E\]/gi, replacement: 'bg-blue-600' },
  { regex: /bg-\[#115E59\]/gi, replacement: 'bg-blue-700' },
  { regex: /bg-teal-600/g, replacement: 'bg-blue-600' },
  { regex: /bg-teal-700/g, replacement: 'bg-blue-700' },
  { regex: /bg-teal-50/g, replacement: 'bg-blue-50' },
  { regex: /bg-teal-100/g, replacement: 'bg-blue-100' },
  
  // Background Colors - brand dark
  { regex: /bg-\[#1E293B\]/gi, replacement: 'bg-[#0B1220]' },
  { regex: /bg-\[#0F172A\]/gi, replacement: 'bg-[#0B1220]' },
  { regex: /bg-slate-900/g, replacement: 'bg-[#0B1220]' },
  { regex: /bg-slate-800/g, replacement: 'bg-[#111827]' },
  
  // Background Colors - neutral light
  { regex: /bg-\[#FAF9F6\]/gi, replacement: 'bg-gray-50' },
  { regex: /bg-\[#F8FAFC\]/gi, replacement: 'bg-gray-50' },
  { regex: /bg-slate-50/g, replacement: 'bg-gray-50' },
  { regex: /bg-slate-100/g, replacement: 'bg-gray-100' },

  // Text Colors - primary accent
  { regex: /text-\[#0F766E\]/gi, replacement: 'text-blue-600' },
  { regex: /text-\[#115E59\]/gi, replacement: 'text-blue-700' },
  { regex: /text-teal-600/g, replacement: 'text-blue-600' },
  { regex: /text-teal-700/g, replacement: 'text-blue-700' },
  
  // Text Colors - text darks/neutrals
  { regex: /text-\[#1E293B\]/gi, replacement: 'text-gray-900' },
  { regex: /text-\[#0F172A\]/gi, replacement: 'text-gray-900' },
  { regex: /text-\[#334155\]/gi, replacement: 'text-gray-700' },
  { regex: /text-\[#475569\]/gi, replacement: 'text-gray-500' },
  { regex: /text-\[#64748B\]/gi, replacement: 'text-gray-500' },
  { regex: /text-\[#94A3B8\]/gi, replacement: 'text-gray-400' },
  { regex: /text-slate-900/g, replacement: 'text-gray-900' },
  { regex: /text-slate-800/g, replacement: 'text-gray-800' },
  { regex: /text-slate-700/g, replacement: 'text-gray-700' },
  { regex: /text-slate-600/g, replacement: 'text-gray-600' },
  { regex: /text-slate-500/g, replacement: 'text-gray-500' },
  { regex: /text-slate-400/g, replacement: 'text-gray-400' },

  // Borders
  { regex: /border-\[#0F766E\]/gi, replacement: 'border-blue-600' },
  { regex: /border-\[#1E293B\]/gi, replacement: 'border-[#0B1220]' },
  { regex: /border-\[#E2E8F0\]/gi, replacement: 'border-gray-200' },
  { regex: /border-\[#F1F5F9\]/gi, replacement: 'border-gray-100' },
  { regex: /border-slate-200/g, replacement: 'border-gray-200' },
  { regex: /border-slate-300/g, replacement: 'border-gray-300' },
  { regex: /border-slate-700/g, replacement: 'border-[#1f2937]' },
  { regex: /border-teal-200/g, replacement: 'border-blue-200' },
  
  // Rings
  { regex: /ring-teal-500/g, replacement: 'ring-blue-500' },
  { regex: /ring-slate-900/g, replacement: 'ring-[#0B1220]' },
  
  // Hover Backgrounds
  { regex: /hover:bg-\[#115E59\]/gi, replacement: 'hover:bg-blue-700' },
  { regex: /hover:bg-teal-700/g, replacement: 'hover:bg-blue-700' },
  { regex: /hover:bg-teal-50/g, replacement: 'hover:bg-blue-50' },
  { regex: /hover:bg-slate-100/g, replacement: 'hover:bg-gray-100' },
  { regex: /hover:bg-slate-800/g, replacement: 'hover:bg-[#111827]' },
  { regex: /hover:bg-slate-50/g, replacement: 'hover:bg-gray-50' },

  // Radii - Flattening the UI for a Vercel/Linear look
  { regex: /rounded-2xl/g, replacement: 'rounded-lg' },
  { regex: /rounded-3xl/g, replacement: 'rounded-xl' },

  // Gradients (Remove excessive gradients)
  { regex: /bg-gradient-to-r from-teal-900 to-slate-900/g, replacement: 'bg-[#0B1220]' },
  { regex: /bg-gradient-to-br from-\[#0F766E\] to-\[#0F172A\]/g, replacement: 'bg-[#0B1220]' },
  { regex: /bg-gradient-to-r from-teal-600 to-teal-800/g, replacement: 'bg-blue-600' },
  { regex: /bg-gradient-to-r/g, replacement: '' },
  { regex: /from-teal-\d+/g, replacement: '' },
  { regex: /to-teal-\d+/g, replacement: '' },
  { regex: /to-slate-\d+/g, replacement: '' }
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const rule of replacements) {
        content = content.replace(rule.regex, rule.replacement);
      }
      
      // Clean up multiple spaces left by removing gradients
      content = content.replace(/  +/g, ' ');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log("Design system variables applied.");
