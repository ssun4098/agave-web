interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    children: React.ReactNode
}

function Button({ variant = 'secondary', children, className, ...rest }: Props) {
    const base = 'px-6 py-2.5 rounded-full font-semibold text-sm cursor-pointer'

    const variants = {
        primary: 'primary-gradient text-white shadow-md shadow-primary/10 hover:scale-95 active:scale-90 active:brightness-90 transition-transform',
        secondary: 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest active:bg-surface-container-highest active:scale-95 transition-all',
        danger: 'bg-error-container text-on-error-container hover:brightness-95 active:brightness-90 active:scale-95 transition-all',
        ghost: 'text-on-surface-variant hover:bg-surface-container active:bg-surface-container-high active:scale-95 transition-all',
    }

    return (
        <button className={`${base} ${variants[variant]} ${className ?? ''}`} {...rest}>
            {children}
        </button>
    )
}

export default Button
