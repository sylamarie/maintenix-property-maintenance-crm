import clsx from 'clsx';

const FilterToolbar = ({ children, className = '' }) => {
  return (
    <section className={clsx('filter-toolbar', className)}>
      {children}
    </section>
  );
};

export default FilterToolbar;
