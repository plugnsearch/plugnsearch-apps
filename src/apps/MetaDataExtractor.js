const { dataExtractor } = require('plugnsearch')

module.exports = class MetaDataExtractor {
  constructor () {
    name = 'MetaDataExtractor'
    noCheerio = true
  }

  process ({ body, report }) {
    return dataExtractor(body)
      .then(meta => {
        report('meta', meta)
      })
  }
}
