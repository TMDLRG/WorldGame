import { describe, expect, it } from 'vitest'
import { en } from './en'

const REQUIRED_KEYS = [
  'home.title',
  'home.trustBanner',
  'home.languageLabel',
  'home.ageBandLabel',
  'home.modeLabel',
  'home.playCta',
  'mode.shapeMemory',
  'mode.colorShape',
  'mode.math',
  'ageBand.4-5',
  'ageBand.6-7',
  'ageBand.8-9',
  'language.en',
  'language.hi',
  'language.es',
  'prompt.colorShape',
  'prompt.math',
  'feedback.tryAgain',
  'feedback.greatJob',
  'reward.title',
  'reward.playAgain',
  'reward.backHome',
  'reward.chooseAnother',
  'a11y.languageSelected',
  'a11y.ageBandSelected',
  'a11y.modeSelected',
  'guide.openLink',
  'guide.title',
  'guide.kidsHeading',
  'guide.kidsWelcome',
  'guide.kidsShapeMemory',
  'guide.kidsColorShape',
  'guide.kidsMath',
  'guide.kidsHaveFun',
  'guide.parentsHeading',
  'guide.parentsPrivacy',
  'guide.parentsAgeBands',
  'guide.parentsModes',
  'guide.parentsAccessibility',
  'guide.parentsLocalStorage',
] as const

describe('OAS-422-T2 en dictionary completeness', () => {
  it.each(REQUIRED_KEYS)('contains required MVP UI key %s', (key) => {
    expect(en[key as keyof typeof en], `en.${key}`).toBeTypeOf('string')
    expect(en[key as keyof typeof en]?.length ?? 0).toBeGreaterThan(0)
  })

  it('has no empty values', () => {
    for (const [k, v] of Object.entries(en)) {
      expect(v, `en.${k}`).toBeTypeOf('string')
      expect((v as string).length, `en.${k}`).toBeGreaterThan(0)
    }
  })
})
