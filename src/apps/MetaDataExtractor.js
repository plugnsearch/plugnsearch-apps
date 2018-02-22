import { dataExtractor } from 'plugnsearch'

export default class MetaDataExtractor {
  name = 'MetaDataExtractor'
  noCheerio = true

  process ({ body, report }) {
    return dataExtractor(body)
      .then(meta => {
        report('meta', meta)
      })
  }
}
