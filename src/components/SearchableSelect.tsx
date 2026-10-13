import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
  subtext?: string;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  allowCustom?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Pilih...',
  searchPlaceholder = 'Cari...',
  disabled = false,
  className = '',
  allowCustom = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase()) ||
      (opt.badge && opt.badge.toLowerCase().includes(search.toLowerCase())) ||
      (opt.subtext && opt.subtext.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleAddCustom = () => {
    if (search.trim()) {
      onChange(search.trim());
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left bg-white border border-stone-300 rounded-xl shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-600 ${
          disabled ? 'opacity-60 cursor-not-allowed bg-stone-100' : 'hover:border-stone-400 cursor-pointer'
        }`}
      >
        <span className={`block truncate text-sm ${selectedOption || value ? 'text-stone-900 font-medium' : 'text-stone-400'}`}>
          {selectedOption ? selectedOption.label : value ? value : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 ml-2 text-stone-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden text-sm animate-in fade-in zoom-in-95 duration-100 min-w-[220px]">
          {/* Search Bar */}
          <div className="p-2 border-b border-stone-100 bg-stone-50/80 sticky top-0">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-stone-400 absolute left-2.5 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm bg-white border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-stone-50 py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-sky-50/70 text-sky-900 font-medium'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate text-xs sm:text-sm">{opt.label}</div>
                      {opt.subtext && (
                        <div className="text-[11px] text-stone-500 truncate">{opt.subtext}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {opt.badge && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="w-4 h-4 text-sky-600" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-stone-500">
                <div>Tidak ada hasil untuk "{search}"</div>
                {allowCustom && search.trim() && (
                  <button
                    type="button"
                    onClick={handleAddCustom}
                    className="mt-2 text-xs font-medium text-sky-600 hover:text-sky-700 underline"
                  >
                    Gunakan "{search.trim()}"
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
