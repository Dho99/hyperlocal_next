export function TopographicPattern({ className, opacity = 0.05 }: { className?: string; opacity?: number }) {
    return (
        <div className={className} aria-hidden="true">
            <svg
                viewBox="0 0 800 600"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-full w-full"
                style={{ opacity }}
            >
                <path
                    d="M0 300 C100 200 200 400 300 300 C400 200 500 350 600 280 C700 210 800 320 800 320"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                />
                <path
                    d="M0 240 C80 160 170 300 260 240 C350 180 440 290 530 230 C620 170 710 250 800 220"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                />
                <path
                    d="M0 180 C60 110 140 240 230 180 C320 120 410 230 500 170 C590 110 680 190 800 160"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                />
                <path
                    d="M0 120 C40 60 110 180 200 120 C290 60 380 170 470 110 C560 50 650 130 800 100"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                />
                <path
                    d="M0 360 C120 280 230 420 340 360 C450 300 560 400 670 340 C780 280 800 380 800 380"
                    stroke="currentColor"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                />
                <path
                    d="M0 420 C140 350 260 470 380 420 C500 370 620 450 740 400 C800 370 800 440 800 440"
                    stroke="currentColor"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                />
                <path
                    d="M0 480 C160 420 290 520 410 480 C530 440 660 500 800 460"
                    stroke="currentColor"
                    strokeWidth="0.8"
                    vectorEffect="non-scaling-stroke"
                />
                <circle cx="400" cy="300" r="120" stroke="currentColor" strokeWidth="1" />
                <circle cx="400" cy="300" r="200" stroke="currentColor" strokeWidth="0.8" />
                <circle cx="400" cy="300" r="280" stroke="currentColor" strokeWidth="0.6" />
            </svg>
        </div>
    );
}
