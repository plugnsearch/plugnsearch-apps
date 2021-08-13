const { URL } = require("@plugnsearch/core");
const Scraper = require("../Scraper");

module.exports = class DataScraper {
  constructor({ dataMapping }) {
    this.name = "DataScraper";
    this.noCheerio = true;

    this.dataMapping = Object.keys(dataMapping).reduce(
      (memo, url) => ({
        ...memo,
        [new URL(url).normalizedHref]: dataMapping[url],
      }),
      {}
    );
  }

  findMappingForUrl(url) {
    const key = Object.keys(this.dataMapping).find(
      (key) => url.indexOf(key) === 0
    );
    return this.dataMapping[key];
  }

  process({ body, url, report }) {
    const mapping = this.findMappingForUrl(url.toString());
    if (!mapping) {
      report("DataScraperError", "No Mapping found for URL.");
      return;
    }
    const scraper = new Scraper(mapping);

    report("data", scraper.parse(body));
  }
};
