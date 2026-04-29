import { Intent, PromptContext } from '@/app/types'

function addContext(ctx: PromptContext): string {
  const parts: string[] = []
  if (ctx.language) parts.push(`Language: ${ctx.language}`)
  if (ctx.framework) parts.push(`Framework: ${ctx.framework}`)
  if (ctx.fileRefs.length) parts.push(`Files: ${ctx.fileRefs.join(', ')}`)
  return parts.length ? `\n\nContext:\n${parts.map((p) => `- ${p}`).join('\n')}` : ''
}

const TEMPLATES: Record<Intent, (ctx: PromptContext) => string> = {
  build: (ctx) =>
    `Build the following:\n\n${ctx.rawInput}\n\nRequirements:\n- Write clean, production-quality code\n- Include proper TypeScript types\n- Follow existing project conventions\n- Include error handling where appropriate${addContext(ctx)}`,

  fix: (ctx) =>
    `Debug and fix this issue:\n\n${ctx.rawInput}\n\nPlease:\n1. Identify the root cause\n2. Explain why the bug occurs\n3. Provide the corrected code\n4. Suggest how to prevent similar issues${addContext(ctx)}`,

  explain: (ctx) =>
    `Explain the following in clear, simple terms:\n\n${ctx.rawInput}\n\nPlease:\n- Break it down step by step\n- Use examples where helpful\n- Highlight key concepts${addContext(ctx)}`,

  refactor: (ctx) =>
    `Refactor the following:\n\n${ctx.rawInput}\n\nPlease:\n- Show the improved code\n- Explain what changed and why\n- Maintain the same functionality\n- Improve readability and maintainability${addContext(ctx)}`,

  test: (ctx) =>
    `Write tests for the following:\n\n${ctx.rawInput}\n\nPlease:\n- Cover the main functionality and edge cases\n- Use clear test descriptions\n- Include setup and teardown if needed${addContext(ctx)}`,

  deploy: (ctx) =>
    `Help with deployment:\n\n${ctx.rawInput}\n\nPlease:\n- Provide step-by-step instructions\n- Include any configuration needed\n- Note potential issues to watch for${addContext(ctx)}`,

  general: (ctx) =>
    ctx.rawInput + addContext(ctx),
}

export function applyTemplate(ctx: PromptContext): string {
  return TEMPLATES[ctx.intent](ctx)
}
