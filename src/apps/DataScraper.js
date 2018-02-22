import Scraper from '../Scraper'

export default class DataScraper {
  noCheerio = true

  constructor ({ dataMapping }) {
    this.dataMapping = dataMapping
  }

  findMappingForUrl (url) {
    const key = Object.keys(this.dataMapping).find(key => url.indexOf(key) === 0)
    return this.dataMapping[key]
  }

  process ({ body, url, report }) {
    const mapping = this.findMappingForUrl(url.toString())
    if (!mapping) {
      report('DataScraperError', 'No Mapping found for URL.')
      return
    }
    const scraper = new Scraper(mapping)

    report('data', scraper.parse(body))
  }
}
