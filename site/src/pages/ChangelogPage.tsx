import { Suspense, lazy } from 'react'
import { usePageMeta } from '../hooks/usePageMeta'
import { ScrollReveal } from '../components/ScrollReveal'

const Changelog = lazy(() => import('../components/Changelog').then(m => ({ default: m.Changelog })))

function SectionFallback() {
  return <div className="py-24" />
}

export function ChangelogPage() {
  usePageMeta({
    title: 'Changelog',
    description: 'KinBot release history and what changed in each version.',
  })

  return (
    <div className="pt-24">
      <Suspense fallback={<SectionFallback />}>
        <ScrollReveal><Changelog /></ScrollReveal>
      </Suspense>
    </div>
  )
}
