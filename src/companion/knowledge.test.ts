import { describe, expect, it } from 'vitest'
import { buildKnowledge, retrieve } from './knowledge'

const kb = buildKnowledge()
describe('knowledge retrieval', () => {
  it('finds a project by name', () => {
    expect(retrieve('tell me about EventZee', kb)[0].id).toBe('eventzee')
  })
  it('flow & magic is honestly a concept', () => {
    const e = retrieve('what is flow and magic', kb)[0]
    expect(e.id).toBe('flow-magic')
    expect(e.text).toMatch(/Nothing is implemented yet/)
  })
  it('returns nothing for unrelated questions', () => {
    expect(retrieve('what is the weather on mars', kb)).toEqual([])
  })
  it('never claims awards', () => {
    expect(retrieve('has he won any awards', kb)[0].text).toMatch(/no awards on record/)
  })
})
