/* eslint-env jest */
import fs from 'fs'
import path from 'path'
import { URL } from 'plugnsearch'
import DataScraper from '../../src/apps/DataScraper'

describe('DataScraper', () => {
  let testpage
  let app
  const MAPPING = {
    'http://test.de/expose': {
      OG: {
        title: 'og:title',
        myName: 'og:site_name',
        description: 'og:description',
        image: 'og:image'
      },
      FIX: {
        type: 'Offer',
        foo: 'Bar'
      },
      HTML: {
        title: 'h1',
        description: '.content p',
        something: '.thatisnotthere',
        image: $ => $('img').attr('src')
      }
    },
    'http://test.de/something/else': {
      OG: {
        theTitle: 'og:title'
      }
    },
    'http://blabla.de/talks': {
      HTML: {
        title: 'body h1',
        intro: '.content p:first-child',
        footer: 'p:last-child'
      }
    }
  }

  beforeEach(done => {
    fs.readFile(path.join(__dirname, '../fixtures/testpage.html'), 'UTF-8', (_err, content) => {
      testpage = content
      done()
    })
    app = new DataScraper({ dataMapping: MAPPING })
  })

  it('uses the mapping for the right page', () => {
    const report = jest.fn()
    app.process({
      body: testpage,
      url: 'http://test.de/expose/something/123456',
      report
    })
    expect(report).toHaveBeenCalledWith('data', expect.objectContaining({
      type: 'Offer',
      foo: 'Bar',
      title: 'A better Title',
      myName: 'Name',
      description: 'Desc'
    }))
  })

  it('works with URL object', () => {
    const report = jest.fn()
    app.process({
      body: testpage,
      url: new URL('http://test.de/expose/something/123456'),
      report
    })
    expect(report).toHaveBeenCalledWith('data', expect.objectContaining({
      type: 'Offer',
      foo: 'Bar',
      title: 'A better Title',
      myName: 'Name',
      description: 'Desc'
    }))
  })

  it('normalizes the mapping keys', function() {
    const dataMapping = {
      'http://www.test.de/expose': MAPPING['http://test.de/expose']
    }
    app = new DataScraper({ dataMapping })
    const report = jest.fn()
    app.process({
      body: testpage,
      url: 'http://test.de/expose/something/123456',
      report
    })
    expect(report).toHaveBeenCalledWith('data', expect.objectContaining({
      type: 'Offer',
      foo: 'Bar',
      title: 'A better Title',
      myName: 'Name',
      description: 'Desc'
    }))
  });

  it('reports error if no mapping is found for given URL', () => {
    const report = jest.fn()
    app.process({
      body: testpage,
      url: 'http://test.de/something/123456',
      report
    })
    expect(report).toHaveBeenCalledWith('DataScraperError', 'No Mapping found for URL.')
  })
})
