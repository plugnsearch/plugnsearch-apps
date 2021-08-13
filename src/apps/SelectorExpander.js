const NodeURL = require("url").URL;
const { URL } = require("plugnsearch-core");

/**
 * Ensures that returned url is an aboslute one. If given url is relative, it uses
 * the base of baseUrl to make it absolute.
 */
function makeUrlAbsolute(baseUrl, url) {
  const urlObject = new NodeURL(url, baseUrl);
  return urlObject.href;
}

/**
 * Retrieves all http & https links from a website and adds them to the queue.
 * It won't find links outside an <a>-element and omits all non-http-links, like
 * mailto- or tel-links.
 */
module.exports = class SelectorExpander {
  constructor({ expandSelector } = {}) {
    this.name = "SelectorExpander";
    this.expandSelector = expandSelector;
  }

  process({ $, url, queueUrls }) {
    const links = $(this.expandSelector)
      .map((i, link) => $(link).attr("href"))
      .get()
      .map((path) => makeUrlAbsolute(url.toString(), path));

    queueUrls(links);
  }
};
