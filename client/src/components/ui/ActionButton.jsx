import clsx from 'clsx';

const ActionButton = ({
  as: Component = 'button',
  children,
  className = '',
  icon: Icon,
  size = 'md',
  variant = 'primary',
  ...props
}) => {
  const componentProps =
    Component === 'button' && !props.type ? { type: 'button', ...props } : props;

  return (
    <Component
      className={clsx(
        'btn',
        size === 'sm' && 'btn-sm',
        variant === 'primary' && 'btn-primary',
        variant === 'secondary' && 'btn-secondary',
        variant === 'danger' && 'btn-danger',
        className
      )}
      {...componentProps}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      <span>{children}</span>
    </Component>
  );
};

export default ActionButton;
