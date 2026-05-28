import { AIGenerator } from '@/components/generate/AIGenerator'

export default function GeneratePage() {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-card/70 p-4 sm:p-6">
        <div className="font-heading text-xl text-text sm:text-3xl">AI Generator</div>
        <div className="mt-2 text-sm text-subtext">
          Generate a summary, flashcards, a quiz, and key facts from notes, YouTube, or a PDF.
        </div>
      </div>
      <AIGenerator />
    </div>
  )
}
