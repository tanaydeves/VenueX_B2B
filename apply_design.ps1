$srcDir = "d:\VenueX\src\components"
$files = Get-ChildItem -Path $srcDir -Filter *.tsx -Recurse

$replacements = @(
    @{ Regex = "font-\['Plus_Jakarta_Sans'\]"; Replacement = "font-sans" },
    
    # Background Colors - primary accent
    @{ Regex = "bg-\[#0F766E\]"; Replacement = "bg-blue-600" },
    @{ Regex = "bg-\[#115E59\]"; Replacement = "bg-blue-700" },
    @{ Regex = "bg-teal-600"; Replacement = "bg-blue-600" },
    @{ Regex = "bg-teal-700"; Replacement = "bg-blue-700" },
    @{ Regex = "bg-teal-50"; Replacement = "bg-blue-50" },
    @{ Regex = "bg-teal-100"; Replacement = "bg-blue-100" },
    
    # Background Colors - brand dark
    @{ Regex = "bg-\[#1E293B\]"; Replacement = "bg-[#0B1220]" },
    @{ Regex = "bg-\[#0F172A\]"; Replacement = "bg-[#0B1220]" },
    @{ Regex = "bg-slate-900"; Replacement = "bg-[#0B1220]" },
    @{ Regex = "bg-slate-800"; Replacement = "bg-[#111827]" },
    
    # Background Colors - neutral light
    @{ Regex = "bg-\[#FAF9F6\]"; Replacement = "bg-gray-50" },
    @{ Regex = "bg-\[#F8FAFC\]"; Replacement = "bg-gray-50" },
    @{ Regex = "bg-slate-50"; Replacement = "bg-gray-50" },
    @{ Regex = "bg-slate-100"; Replacement = "bg-gray-100" },

    # Text Colors - primary accent
    @{ Regex = "text-\[#0F766E\]"; Replacement = "text-blue-600" },
    @{ Regex = "text-\[#115E59\]"; Replacement = "text-blue-700" },
    @{ Regex = "text-teal-600"; Replacement = "text-blue-600" },
    @{ Regex = "text-teal-700"; Replacement = "text-blue-700" },
    
    # Text Colors - text darks/neutrals
    @{ Regex = "text-\[#1E293B\]"; Replacement = "text-gray-900" },
    @{ Regex = "text-\[#0F172A\]"; Replacement = "text-gray-900" },
    @{ Regex = "text-\[#334155\]"; Replacement = "text-gray-700" },
    @{ Regex = "text-\[#475569\]"; Replacement = "text-gray-500" },
    @{ Regex = "text-\[#64748B\]"; Replacement = "text-gray-500" },
    @{ Regex = "text-\[#94A3B8\]"; Replacement = "text-gray-400" },
    @{ Regex = "text-slate-900"; Replacement = "text-gray-900" },
    @{ Regex = "text-slate-800"; Replacement = "text-gray-800" },
    @{ Regex = "text-slate-700"; Replacement = "text-gray-700" },
    @{ Regex = "text-slate-600"; Replacement = "text-gray-600" },
    @{ Regex = "text-slate-500"; Replacement = "text-gray-500" },
    @{ Regex = "text-slate-400"; Replacement = "text-gray-400" },

    # Borders
    @{ Regex = "border-\[#0F766E\]"; Replacement = "border-blue-600" },
    @{ Regex = "border-\[#1E293B\]"; Replacement = "border-[#0B1220]" },
    @{ Regex = "border-\[#E2E8F0\]"; Replacement = "border-gray-200" },
    @{ Regex = "border-\[#F1F5F9\]"; Replacement = "border-gray-100" },
    @{ Regex = "border-slate-200"; Replacement = "border-gray-200" },
    @{ Regex = "border-slate-300"; Replacement = "border-gray-300" },
    @{ Regex = "border-slate-700"; Replacement = "border-[#1f2937]" },
    @{ Regex = "border-teal-200"; Replacement = "border-blue-200" },
    
    # Rings
    @{ Regex = "ring-teal-500"; Replacement = "ring-blue-500" },
    @{ Regex = "ring-slate-900"; Replacement = "ring-[#0B1220]" },
    
    # Hover Backgrounds
    @{ Regex = "hover:bg-\[#115E59\]"; Replacement = "hover:bg-blue-700" },
    @{ Regex = "hover:bg-teal-700"; Replacement = "hover:bg-blue-700" },
    @{ Regex = "hover:bg-teal-50"; Replacement = "hover:bg-blue-50" },
    @{ Regex = "hover:bg-slate-100"; Replacement = "hover:bg-gray-100" },
    @{ Regex = "hover:bg-slate-800"; Replacement = "hover:bg-[#111827]" },
    @{ Regex = "hover:bg-slate-50"; Replacement = "hover:bg-gray-50" },

    # Radii
    @{ Regex = "rounded-2xl"; Replacement = "rounded-lg" },
    @{ Regex = "rounded-3xl"; Replacement = "rounded-xl" },

    # Gradients
    @{ Regex = "bg-gradient-to-r from-teal-900 to-slate-900"; Replacement = "bg-[#0B1220]" },
    @{ Regex = "bg-gradient-to-br from-\[#0F766E\] to-\[#0F172A\]"; Replacement = "bg-[#0B1220]" },
    @{ Regex = "bg-gradient-to-r from-teal-600 to-teal-800"; Replacement = "bg-blue-600" }
)

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content
    
    foreach ($rule in $replacements) {
        $content = $content -replace $rule.Regex, $rule.Replacement
    }
    
    # Remove excessive gradient parts remaining
    $content = $content -replace "bg-gradient-to-r\s*", ""
    $content = $content -replace "from-teal-\d+\s*", ""
    $content = $content -replace "to-teal-\d+\s*", ""
    $content = $content -replace "to-slate-\d+\s*", ""
    
    if ($content -cne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.Name)"
    }
}
Write-Host "Done applying design system."
