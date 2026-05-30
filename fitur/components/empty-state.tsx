interface EmptyStateProps {
    message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
    return (
        <div className="col-span-full rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 p-8 text-center text-sm font-medium text-stone-600">
            {message}
        </div>
    );
}
