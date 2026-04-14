import { describe, it, expect } from 'vitest'
import { detectIdentifierType } from './resolver'

describe('detectIdentifierType', () => {
  it('detects ASIN', () => { expect(detectIdentifierType('B08N5WRWNW')).toBe('asin') })
  it('detects UPC-12', () => { expect(detectIdentifierType('012345678905')).toBe('upc') })
  it('detects EAN-13', () => { expect(detectIdentifierType('5012345678900')).toBe('ean') })
  it('detects ISBN-13', () => { expect(detectIdentifierType('9780140328721')).toBe('isbn') })
  it('detects URL', () => { expect(detectIdentifierType('https://amazon.co.uk/dp/B00123ABCD')).toBe('url') })
  it('unknown garbage', () => { expect(detectIdentifierType('hello world')).toBe('unknown') })
})
