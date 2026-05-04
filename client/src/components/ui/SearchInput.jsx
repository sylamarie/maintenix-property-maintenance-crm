import { Search } from 'lucide-react';
import { useId } from 'react';

const SearchInput = ({
  className = '',
  id,
  label = 'Search',
  name,
  placeholder = 'Search',
  value,
  onChange
}) => {
  const generatedId = useId();
  const inputId = id || name || `search-${generatedId}`;

  return (
    <div className={className}>
      <label className="label" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative mt-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400"
          aria-hidden="true"
        />
        <input
          id={inputId}
          name={name}
          className="input pl-9"
          type="search"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchInput;
