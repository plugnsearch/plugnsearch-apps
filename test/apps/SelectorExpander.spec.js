/* eslint-env jest */
const cheerio = require('cheerio')
const { URL } = require('plugnsearch')
const { SelectorExpander } = require('../../')

const BODY = `
<html>
<body>
  <a href="/test.de">Logo</a>
  <ul class="pagination">
   <li><a href="/test.de?page=1">Page 1</a></li>
   <li><a href="test.de?page=2">Page 2</a></li>
   <li><a href="http://somewhere.else.com/test.de?page=3">Page 3</a></li>
  </ul>
</body>
</html>
`

describe('SelectorExpander', () => {
  let app

  beforeEach(() => {
    app = new SelectorExpander({
      expandSelector: '.pagination a'
    })
  })

  it('uses the expandSelector to get the links', done => {
    const $ = cheerio.load(BODY)
    expect.assertions(1)
    app.process({
      $,
      url: new URL('http://some.rainbow.com/over-it/of-course'),
      queueUrls: (urls) => {
        expect(urls).toEqual([
          'http://some.rainbow.com/test.de?page=1',
          'http://some.rainbow.com/over-it/test.de?page=2',
          'http://somewhere.else.com/test.de?page=3'
        ])
        done()
      }
    })
  })

  it('does not expand anything if no matching selectors are found', done => {
    app = new SelectorExpander({
      expandSelector: '.no-pagination a'
    })
    const $ = cheerio.load(BODY)
    expect.assertions(1)
    app.process({
      $,
      url: new URL('http://some.rainbow.com/over-it/of-course'),
      queueUrls: (urls) => {
        expect(urls).toEqual([])
        done()
      }
    })
  })
})
