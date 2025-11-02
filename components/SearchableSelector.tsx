import React, { useState, useMemo, useRef, useEffect } from 'react';

interface SearchableSelectorProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  onUpdate: (value: string) => void;
  required?: boolean;
  variant?: 'boxed' | 'underline';
  error?: string;
}

const SearchableSelector: React.FC<SearchableSelectorProps> = ({ id, label, value, options, onUpdate, required, variant = 'boxed', error }) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) {
      return options;
    }
    return options.filter(option =>
      option.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, options]);

  const handleSelect = (option: string) => {
    setSearchTerm(option);
    onUpdate(option);
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If the user clicks outside and the input doesn't match a valid option, reset it to the original value
        if (!options.includes(searchTerm)) {
            setSearchTerm(value);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef, searchTerm, value, options]);
  
  const baseInputClasses = "w-full text-white focus:outline-none focus:ring-0";
  const variantClasses = {
      boxed: `bg-[#005ca0] border rounded-md p-2 ${error ? 'border-red-500' : 'border-[#005ca0]'}`,
      underline: `bg-transparent border-0 border-b p-2 ${error ? 'border-red-500' : 'border-[#005ca0] focus:border-[#ff8400]'}`
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label htmlFor={id} className="block text-sm font-medium text-white mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        id={id}
        type="text"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          onUpdate(e.target.value); // Update form state on change to clear error
          if (!isOpen) setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className={`${baseInputClasses} ${variantClasses[variant]}`}
        autoComplete="off"
        required={required}
      />
      {isOpen && (
        <ul className="absolute z-10 w-full bg-[#003a70] border border-[#005ca0] rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <li
                key={option}
                onClick={() => handleSelect(option)}
                className="px-4 py-2 text-white cursor-pointer hover:bg-[#005ca0]"
              >
                {option}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-400">No options found</li>
          )}
        </ul>
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default SearchableSelector;