import { useState } from 'react'
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react'

interface Screenshot {
  src: string
  title: string
  description: string
}

const screenshots: Screenshot[] = [
  {
    src: '/kinbot/screenshots/frame_1.png',
    title: 'Multi-Agent Workspace',
    description:
      'Multiple specialized Kins in the sidebar, scheduled jobs running autonomously, and persistent memory indicators on every message.',
  },
  {
    src: '/kinbot/screenshots/frame_5.png',
    title: 'Live Delegation & Sub-tasks',
    description:
      'KinMaster delegates to Dorian (finance) and Axiom (tech) simultaneously, spawns sub-tasks, and pulls results back in real time.',
  },
  {
    src: '/kinbot/screenshots/frame_7.png',
    title: 'Memory, Search & Contact Registry',
    description:
      'Web search results, instant memory recall of 6 stored facts, shared contact registry across all Kins, and a sub-task running in parallel.',
  },
]

function Lightbox({
  screenshot,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  screenshot: Screenshot
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  hasPrev: boolean
  hasNext: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
        style={{ color: 'white' }}
        aria-label="Close"
      >
        <X size={24} />
      </button>

      {hasPrev && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onPrev()
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ color: 'white' }}
          aria-label="Previous"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onNext()
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
          style={{ color: 'white' }}
          aria-label="Next"
        >
          <ChevronRight size={28} />
        </button>
      )}

      <div
        className="max-w-6xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={screenshot.src}
          alt={screenshot.title}
          className="w-full rounded-xl shadow-2xl"
          loading="lazy"
        />
        <div className="text-center mt-4">
          <h3 className="text-lg font-semibold text-white">{screenshot.title}</h3>
          <p className="text-sm text-white/60 mt-1 max-w-xl mx-auto">{screenshot.description}</p>
        </div>
      </div>
    </div>
  )
}

export function Screenshots() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  return (
    <>
      <section id="screenshots" className="px-6 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span style={{ color: 'var(--color-foreground)' }}>See it in </span>
            <span className="gradient-text">action.</span>
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{ color: 'var(--color-muted-foreground)' }}
          >
            Real screenshots from a live KinBot instance with multiple agents working together.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {screenshots.map((screenshot, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="group glass-strong gradient-border rounded-2xl overflow-hidden text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
              style={{ boxShadow: 'var(--shadow-md)' }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={screenshot.src}
                  alt={screenshot.title}
                  className="w-full block transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'rgba(0,0,0,0.3)' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20 backdrop-blur-sm">
                    <Maximize2 size={20} className="text-white" />
                  </div>
                </div>
              </div>
              <div className="p-5">
                <h3
                  className="font-semibold text-base mb-1"
                  style={{ color: 'var(--color-foreground)' }}
                >
                  {screenshot.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--color-muted-foreground)' }}
                >
                  {screenshot.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {lightboxIndex !== null && (
        <Lightbox
          screenshot={screenshots[lightboxIndex]}
          onClose={() => setLightboxIndex(null)}
          onPrev={() => setLightboxIndex((i) => Math.max(0, (i ?? 0) - 1))}
          onNext={() =>
            setLightboxIndex((i) => Math.min(screenshots.length - 1, (i ?? 0) + 1))
          }
          hasPrev={lightboxIndex > 0}
          hasNext={lightboxIndex < screenshots.length - 1}
        />
      )}
    </>
  )
}
