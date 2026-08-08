import Reveal from './Reveal'
import Icon from './Icon'
import type { Project } from '../lib/site'

function host(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

export default function WorkCard({ p, delay = 0 }: { p: Project; delay?: number }) {
  const inner = (
    <>
      <div className="chrome">
        <div className="chrome-bar">
          <span className="chrome-dot" />
          <span className="chrome-dot" />
          <span className="chrome-dot" />
          <span className="chrome-url">{p.href ? host(p.href) : 'private beta'}</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.img}
          alt={p.alt}
          loading="lazy"
          width={1600}
          height={1000}
          className="block w-full aspect-[16/10] object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="mt-6">
        <p className="eyebrow text-cream-dim">{p.kind}</p>
        <h3 className="d3 mt-3 text-cream flex items-center gap-2">
          {p.name}
          {p.href && (
            <Icon
              name="arrow"
              className="w-5 h-5 text-cream-dim transition-all group-hover:text-accent group-hover:translate-x-1"
            />
          )}
        </h3>
        <p className="mt-3 text-cream-dim measure">{p.desc}</p>
        <p className="mt-3 text-sm text-cream-dim/85 measure">{p.detail}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {p.tags.map(t => (
            <li
              key={t}
              className="text-xs px-2.5 py-1 rounded-full border border-line text-cream-dim"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
    </>
  )

  return (
    <Reveal delay={delay}>
      {p.href ? (
        <a href={p.href} target="_blank" rel="noopener" className="group block">
          {inner}
        </a>
      ) : (
        <div className="group">{inner}</div>
      )}
    </Reveal>
  )
}
