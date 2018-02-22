/* eslint-env jest */
import fs from 'fs'
import path from 'path'
import Scraper from '../src/Scraper'

describe('Scraper', () => {
  let testpage
  const MAPPING = {
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
      footer: 'body > p',
      something: '.thatisnotthere',
      image: $ => $('img').attr('src')
    }
  }

  beforeEach(done => {
    fs.readFile(path.join(__dirname, 'fixtures/testpage.html'), 'UTF-8', (_err, content) => {
      testpage = content
      done()
    })
  })

  it('can return nothing', () => {
    const scraper = new Scraper({})

    expect(scraper.parse(testpage)).toEqual({})
  })

  it('uses a mapping to parse a html page', () => {
    const scraper = new Scraper({ HTML: MAPPING.HTML })

    expect(scraper.parse(testpage)).toEqual(expect.objectContaining({
      title: 'Title',
      description: 'Lorem ipsum\nDolor ipsum',
      footer: '    FOOTER    ',
      something: null,
      image: 'http://localhost:1234/image.jpg'
    }))
  })

  it('can have some FIXED attributes', () => {
    const scraper = new Scraper(MAPPING)

    expect(scraper.parse(testpage)).toEqual(expect.objectContaining({
      type: 'Offer',
      foo: 'Bar'
    }))
  })

  it('can read OG data', () => {
    const scraper = new Scraper(MAPPING)

    expect(scraper.parse(testpage)).toEqual(expect.objectContaining({
      title: 'A better Title',
      myName: 'Name',
      description: 'Desc',
      image: null
    }))
  })

  it('OG data overrides HTML if present', () => {
    const scraper = new Scraper(MAPPING)

    expect(scraper.parse(testpage)).toEqual(expect.objectContaining({
      title: 'A better Title'
    }))
  })

  describe('Postprocessors', () => {
    it('can define Postprocessors as strings and methods', () => {
      const scraper = new Scraper({
        ...MAPPING,
        postProcess: {
          footer: 'trim',
          title: v => v.toUpperCase()
        }
      })

      expect(scraper.parse(testpage)).toEqual(expect.objectContaining({
        title: 'A BETTER TITLE',
        footer: 'FOOTER'
      }))
    })

    it('can define Postprocessor methods and reference them as strings', () => {
      const scraper = new Scraper({
        ...MAPPING,
        postProcess: {
          footer: 'trim',
          description: 'upper',
          title: 'upper'
        },
        processors: {
          upper: v => v.toUpperCase()
        }
      })

      expect(scraper.parse(testpage)).toEqual(expect.objectContaining({
        description: 'DESC',
        title: 'A BETTER TITLE',
        footer: 'FOOTER'
      }))
    })

    it('throws a useful error message if we try a method that is not defined', () => {
      const scraper = new Scraper({
        ...MAPPING,
        postProcess: {
          title: 'upper'
        }
      })

      expect(() => {
        scraper.parse(testpage)
      }).toThrow('Method "upper" is not defined neither as processor nor on string prototype.')
    })
  })
})
