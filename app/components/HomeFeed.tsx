'use client'

import { useApp } from '../providers'
import SubmissionCard from './SubmissionCard'

export default function HomeFeed() {
  const { submissions } = useApp()
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {submissions.slice(0, 8).map((s) => (
        <SubmissionCard key={s.id} submission={s} />
      ))}
    </div>
  )
}
