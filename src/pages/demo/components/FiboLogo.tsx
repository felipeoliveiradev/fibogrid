export function FiboLogo({ className = "h-8 w-8" }: { className?: string }) {
    return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(42 70% 55%)" />
                    <stop offset="50%" stopColor="hsl(40 65% 45%)" />
                    <stop offset="100%" stopColor="hsl(38 60% 35%)" />
                </linearGradient>
            </defs>
            <rect x="10" y="10" width="34" height="34" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="2" />
            <rect x="44" y="10" width="21" height="21" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="1" />
            <rect x="44" y="31" width="13" height="13" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="1" />
            <rect x="57" y="31" width="8" height="8" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="1" />
            <rect x="10" y="50" width="55" height="40" stroke="url(#goldGradient)" strokeWidth="2" fill="none" rx="3" />
            <line x1="10" y1="60" x2="65" y2="60" stroke="url(#goldGradient)" strokeWidth="1.5" />
            <line x1="10" y1="70" x2="65" y2="70" stroke="url(#goldGradient)" strokeWidth="1" />
            <line x1="10" y1="80" x2="65" y2="80" stroke="url(#goldGradient)" strokeWidth="1" />
            <line x1="30" y1="50" x2="30" y2="90" stroke="url(#goldGradient)" strokeWidth="1" />
            <line x1="50" y1="50" x2="50" y2="90" stroke="url(#goldGradient)" strokeWidth="1" />
            <circle cx="80" cy="70" r="12" stroke="url(#goldGradient)" strokeWidth="2" fill="none" />
            <circle cx="80" cy="70" r="7" stroke="url(#goldGradient)" strokeWidth="1.5" fill="hsl(40 65% 45% / 0.2)" />
        </svg>
    );
}

