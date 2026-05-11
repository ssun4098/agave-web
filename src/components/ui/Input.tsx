interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: string
    inputSize?: 'default' | 'large'
    wrapperClassName?: string
}

function Input({ icon, inputSize = 'default', className, wrapperClassName, ...rest }: Props) {
    return (
        <div className={`bg-surface-container-low rounded-2xl flex items-center px-5 py-4 gap-3 shadow-sm shadow-primary/5 focus-within:ring-2 focus-within:ring-primary/30 transition-shadow ${wrapperClassName ?? ''}`}>
            {icon && (
                <span className="material-symbols-outlined text-outline shrink-0">{icon}</span>
            )}
            <input
                className={`w-full bg-transparent outline-none border-none text-on-surface placeholder:text-outline-variant p-0
                    ${inputSize === 'large' ? 'text-2xl font-headline font-bold placeholder:font-bold' : 'font-medium'}
                    ${className ?? ''}`}
                {...rest}
            />
        </div>
    )
}

export default Input
