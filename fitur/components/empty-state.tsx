interface EmptyStateProps {
    message: string;
}

export function EmptyState({ message }: EmptyStateProps) {
    return (
        <div className="col-span-full rounded-2xl border border-dashed border-border bg-muted/60 p-8 text-center text-sm font-medium text-muted-foreground">
            {message}
        </div>
    );
}
