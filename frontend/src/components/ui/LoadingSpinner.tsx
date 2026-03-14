export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-2 border-bg-border border-t-accent-blue rounded-full animate-spin" />
      <p className="text-text-muted text-sm">{text}</p>
    </div>
  )
}
