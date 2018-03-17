import cheerio from 'cheerio'

export default class Scraper {
  constructor (mapping) {
    this.mapping = mapping
  }

  parse (html) {
    const $ = cheerio.load(html)
    return this.postProcess({
      ...(this.mapping.FIX || {}),
      ...this.parseBODY(this.mapping.BODY || {}, html),
      ...this.parseHTML(this.mapping.HTML || {}, html, $),
      ...this.parseOG(this.mapping.OG || {}, html, $)
    })
  }

  postProcess (result) {
    const { processors = {}, postProcess = {} } = this.mapping
    Object.keys(postProcess).forEach(key => {
      const val = postProcess[key]

      if (typeof val === 'string') {
        if (processors[val]) {
          result[key] = processors[val](result[key])
        } else if (typeof result[key][val] === 'function') {
          result[key] = result[key][val]()
        } else {
          throw new Error(`Method "${val}" is not defined neither as processor nor on string prototype.`)
        }
      } else {
        result[key] = val(result[key])
      }
    })
    return result
  }

  parseOG (mapping, html, $) {
    const result = {}

    Object.keys(mapping).forEach(key => {
      result[key] = $(`meta[name="${mapping[key]}"]`).attr('content') || null
    })

    return result
  }

  parseHTML (mapping, html, $) {
    const result = {}

    Object.keys(mapping).forEach(key => {
      if (typeof mapping[key] === 'function') {
        result[key] = mapping[key]($)
      } else {
        const elem = $(mapping[key])
        if (elem.length) {
          result[key] = elem.length > 1
            ? elem.map((i, e) => $(e).text()).get().join('\n')
            : elem.text()
        } else {
          result[key] = null
        }
      }
    })

    return result
  }

  parseBODY (mapping, html) {
    const result = {}

    Object.keys(mapping).forEach(key => {
      result[key] = mapping[key](html)
    })

    return result
  }
}
