import React, { useState, useMemo, useRef, useEffect } from 'react';
import { countries } from '../data/countries';

interface CountrySelectorProps {
  id: string;
  value: string;
  onUpdate: (value: string) => void;
  required?: boolean;
  variant?: 'boxed' | 'underline';
  error?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({ id, value, onUpdate, required, variant = 'boxed', error }) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const filteredCountries = useMemo(() => {
    if (!searchTerm) {
      return countries;
    }
    return countries.filter(country =>
      country.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSelectCountry = (country: string) => {
    setSearchTerm(country);
    onUpdate(country);
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);
  
  const baseInputClasses = "w-full text-white focus:outline-none focus:ring-0";
  const variantClasses = {
      boxed: `bg-[#005ca0] border rounded-md p-2 ${error ? 'border-red-500' : 'border-[#005ca0]'}`,
      underline: `bg-transparent border-0 border-b p-2 ${error ? 'border-red-500' : 'border-[#005ca0] focus:border-[#ff8400]'}`
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <label htmlFor={id} className="block text-sm font-medium text-white mb-1">
        Country {required && <span className="text-red-400">*</span>}
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
          {filteredCountries.length > 0 ? (
            filteredCountries.map(country => (
              <li
                key={country}
                onClick={() => handleSelectCountry(country)}
                className="px-4 py-2 text-white cursor-pointer hover:bg-[#005ca0]"
              >
                {country}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-400">No countries found</li>
          )}
        </ul>
      )}
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default CountrySelector;