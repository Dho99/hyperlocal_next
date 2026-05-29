interface EmptyStateProps {
    message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
    return (
        <div className="col-span-full rounded-xl border border-dashed border-[#cbc4d2] bg-white/60 p-8 text-center text-sm font-medium text-[#494551]">
            {message}
        </div>
    );
}
