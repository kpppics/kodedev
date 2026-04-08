import { SAMPLE_SUBMISSIONS } from '../../data'
import SubmissionContent from './SubmissionContent'

export function generateStaticParams() {
  return SAMPLE_SUBMISSIONS.map((s) => ({ id: s.id }))
}

export const dynamicParams = true

export default function SubmissionPage({ params }: { params: { id: string } }) {
  return <SubmissionContent id={params.id} />
}
