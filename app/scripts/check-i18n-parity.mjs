#!/usr/bin/env node
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const dictDir = resolve(__dirname, '..', 'src', 'i18n', 'dictionaries')

function extractKeys(file) {
  const src = readFileSync(join(dictDir, file), 'utf8')
  const keys = new Set()
  const re = /^[ \t]*'([^']+)'\s*:/gm
  let m
  while ((m = re.exec(src)) !== null) {
    keys.add(m[1])
  }
  return [...keys].sort()
}

const enKeys = extractKeys('en.ts')
const hiKeys = extractKeys('hi.ts')
const esKeys = extractKeys('es.ts')

console.log('en keys:', enKeys.length)
console.log('hi keys:', hiKeys.length)
console.log('es keys:', esKeys.length)

const missingHi = enKeys.filter((k) => !hiKeys.includes(k))
const extraHi = hiKeys.filter((k) => !enKeys.includes(k))
const missingEs = enKeys.filter((k) => !esKeys.includes(k))
const extraEs = esKeys.filter((k) => !enKeys.includes(k))

let drift = false
if (missingHi.length || extraHi.length) {
  console.error('hi drift  missing:', missingHi, 'extra:', extraHi)
  drift = true
}
if (missingEs.length || extraEs.length) {
  console.error('es drift  missing:', missingEs, 'extra:', extraEs)
  drift = true
}

if (drift) {
  process.exit(1)
}
console.log('parity ok')
