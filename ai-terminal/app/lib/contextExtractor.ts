const LANGUAGES: Record<string, string[]> = {
  TypeScript: ['typescript', 'ts', '.ts', '.tsx'],
  JavaScript: ['javascript', 'js', '.js', '.jsx'],
  Python: ['python', 'py', '.py'],
  Rust: ['rust', '.rs'],
  Go: ['golang', 'go', '.go'],
  Java: ['java', '.java'],
  'C#': ['csharp', 'c#', '.cs'],
  CSS: ['css', '.css', 'tailwind', 'stylesheet'],
  HTML: ['html', '.html'],
  SQL: ['sql', '.sql', 'database', 'query', 'postgres', 'mysql'],
  Ruby: ['ruby', '.rb'],
  PHP: ['php', '.php'],
  Swift: ['swift', '.swift'],
  Kotlin: ['kotlin', '.kt'],
}

const FRAMEWORKS: Record<string, string[]> = {
  'Next.js': ['next', 'nextjs', 'next.js'],
  React: ['react', 'jsx', 'tsx', 'component', 'hook', 'usestate', 'useeffect'],
  Vue: ['vue', 'vuejs', 'nuxt'],
  Angular: ['angular', 'ng'],
  Express: ['express', 'expressjs'],
  Django: ['django'],
  Flask: ['flask'],
  'Tailwind CSS': ['tailwind', 'tailwindcss'],
  Prisma: ['prisma'],
  'Node.js': ['node', 'nodejs'],
}

const FILE_REF_REGEX = /(?:^|\s|`)([\w./-]+\.(?:tsx?|jsx?|py|rs|go|java|css|html|sql|json|yaml|yml|md|toml|sh))\b/gi

export function extractContext(input: string): {
  language?: string
  framework?: string
  fileRefs: string[]
} {
  const lower = input.toLowerCase()
  let language: string | undefined
  let framework: string | undefined
  const fileRefs: string[] = []

  for (const [lang, keywords] of Object.entries(LANGUAGES)) {
    if (keywords.some((k) => lower.includes(k))) {
      language = lang
      break
    }
  }

  for (const [fw, keywords] of Object.entries(FRAMEWORKS)) {
    if (keywords.some((k) => lower.includes(k))) {
      framework = fw
      break
    }
  }

  let match: RegExpExecArray | null
  while ((match = FILE_REF_REGEX.exec(input)) !== null) {
    const ref = match[1]
    if (!fileRefs.includes(ref)) {
      fileRefs.push(ref)
    }
  }

  return { language, framework, fileRefs }
}
