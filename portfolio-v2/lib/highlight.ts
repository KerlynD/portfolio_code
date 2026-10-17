import 'server-only'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import css from 'highlight.js/lib/languages/css'
import diff from 'highlight.js/lib/languages/diff'
import go from 'highlight.js/lib/languages/go'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import python from 'highlight.js/lib/languages/python'
import rust from 'highlight.js/lib/languages/rust'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'
import type { MarkedExtension } from 'marked'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('c', c)
hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('css', css)
hljs.registerLanguage('diff', diff)
hljs.registerLanguage('go', go)
hljs.registerLanguage('java', java)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('json', json)
hljs.registerLanguage('markdown', markdown)
hljs.registerLanguage('python', python)
hljs.registerLanguage('rust', rust)
hljs.registerLanguage('sql', sql)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('yaml', yaml)
// bash already answers to sh/zsh; upstream 'shell' is a console-session grammar, here it just means bash
hljs.registerAliases(['shell'], { languageName: 'bash' })

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/** Server-side marked extension: highlights fenced code in registered languages (no auto-detect) and adds a lang/copy bar. */
export function codeExtension(): MarkedExtension {
  return {
    renderer: {
      code({ text, lang }) {
        const name = (lang ?? '').match(/^\S*/)?.[0].toLowerCase() ?? ''
        const code = text.replace(/\n$/, '')
        const body = name && hljs.getLanguage(name)
          ? hljs.highlight(code, { language: name, ignoreIllegals: true }).value
          : escapeHtml(code)
        const label = escapeHtml(name)
        const cls = name ? `hljs language-${label}` : 'hljs'
        return (
          '<div class="code-block"><div class="code-bar">' +
          `<span class="code-lang">${label}</span>` +
          '<button type="button" class="code-copy">copy</button>' +
          `</div><pre><code class="${cls}">${body}\n</code></pre></div>\n`
        )
      },
    },
  }
}
