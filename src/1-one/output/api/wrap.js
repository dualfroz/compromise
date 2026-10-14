import fmts from './_fmts.js'

const toText = function (term) {
  const pre = term.pre || ''
  const post = term.post || ''
  return pre + term.text + post
}

// the match's pre and post are added around fn(m), so m.text() should leave them out
const withoutEnds = function (m) {
  const text = m.text
  m.text = fmt => {
    const opts = typeof fmt === 'string' ? fmts[fmt] : fmt
    return text.call(m, { keepEndPunct: false, ...opts })
  }
  return m
}

const findStarts = function (doc, obj) {
  const starts = {}
  Object.keys(obj).forEach(reg => {
    const m = doc.match(reg)
    m.fullPointer.forEach(a => {
      starts[a[3]] = { fn: obj[reg], end: a[2] }
    })
  })
  return starts
}

const wrap = function (doc, obj) {
  // index ids to highlight
  const starts = findStarts(doc, obj)
  let text = ''
  doc.docs.forEach((terms, n) => {
    for (let i = 0; i < terms.length; i += 1) {
      const t = terms[i]
      // do a span tag
      if (Object.hasOwn(starts, t.id)) {
        const { fn, end } = starts[t.id]
        const m = withoutEnds(doc.update([[n, i, end]]))
        text += terms[i].pre || ''
        text += fn(m)
        i = end - 1
        text += terms[i].post || ''
      } else {
        text += toText(t)
      }
    }
  })
  return text
}
export default wrap