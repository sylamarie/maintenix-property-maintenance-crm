import clsx from 'clsx';

const ActionGroup = ({ children, className = '' }) => {
  return (
    <div className={clsx('flex flex-wrap items-center gap-2', className)}>
      {children}
    </div>
  );
};

export default ActionGroup;
