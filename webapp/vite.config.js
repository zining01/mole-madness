import fs from 'node:fs'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ANNOTATIONS_FILE can point a test server at a scratch copy instead of the real file.
const ANNOTATIONS_FILE =
  process.env.ANNOTATIONS_FILE ?? fileURLToPath(new URL('./src/data/annotations.json', import.meta.url))
// Model second opinions (see data_pipeline/suggest_features.py): the 600-px run
// is the default; the review page can also show the full-resolution run.
const SUGGESTIONS_DIR = fileURLToPath(new URL('../data_pipeline/suggestions/', import.meta.url))
const SUGGESTION_RUNS = {
  web: process.env.SUGGESTIONS_FILE ?? `${SUGGESTIONS_DIR}with_dx.claude-opus-5-5.json`,
  hires: `${SUGGESTIONS_DIR}with_dx.claude-opus-5-5.hires.json`,
  second: `${SUGGESTIONS_DIR}with_dx.claude-opus-5-5.r2.json`, // identical repeat of web, for the two-run rule
  hunt: `${SUGGESTIONS_DIR}hunt_results.json`, // narrow screen for features short of examples (screen_features.py)
}
// Full-resolution originals, for looking at what the full-resolution run saw.
const ORIGINALS_DIR = fileURLToPath(new URL('../data_pipeline/ham10000_data/', import.meta.url))
let originals = null
const findOriginal = (id) => {
  if (!originals) {
    originals = {}
    for (const split of fs.readdirSync(ORIGINALS_DIR).filter((d) => /^derm12345_(train_part_\d|test)$/.test(d))) {
      for (const code of fs.readdirSync(`${ORIGINALS_DIR}${split}`)) {
        const dir = `${ORIGINALS_DIR}${split}/${code}`
        if (!fs.statSync(dir).isDirectory()) continue
        for (const file of fs.readdirSync(dir)) originals[file.replace(/\.jpg$/i, '')] = `${dir}/${file}`
      }
    }
  }
  return originals[id]
}
const IMAGE_ID = /^DERM_\d+$/

const readAnnotations = () =>
  fs.existsSync(ANNOTATIONS_FILE) ? JSON.parse(fs.readFileSync(ANNOTATIONS_FILE, 'utf8')) : {}

// Sorted keys keep git diffs small; write-then-rename so a crash can't leave half a file.
const writeAnnotations = (data) => {
  const sorted = Object.fromEntries(Object.keys(data).sort().map((k) => [k, data[k]]))
  fs.writeFileSync(`${ANNOTATIONS_FILE}.tmp`, JSON.stringify(sorted, null, 2) + '\n')
  fs.renameSync(`${ANNOTATIONS_FILE}.tmp`, ANNOTATIONS_FILE)
}

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => (body += chunk))
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })

// Dev-only endpoints for the /annotate tool:
//   GET    /__suggestions[/hires|/second|/hunt] → model second opinions (read-only)
//   GET    /__original/:id      → full-resolution original image
//   GET    /__annotations       → whole file
//   PUT    /__annotations/:id   → set one image's record
//   DELETE /__annotations/:id   → remove it (back into the queue)
const annotationStore = () => ({
  name: 'annotation-store',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/__suggestions', (req, res) => {
      const run = req.url.replace(/^\//, '') || 'web'
      const file = Object.hasOwn(SUGGESTION_RUNS, run) && SUGGESTION_RUNS[run]
      res.setHeader('Content-Type', 'application/json')
      res.end(file && fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '{}')
    })
    server.middlewares.use('/__original', (req, res) => {
      const id = req.url.replace(/^\//, '')
      const file = IMAGE_ID.test(id) && findOriginal(id)
      if (!file) {
        res.statusCode = 404
        res.end('no original for that id')
        return
      }
      res.setHeader('Content-Type', 'image/jpeg')
      fs.createReadStream(file).pipe(res)
    })
    server.middlewares.use('/__annotations', async (req, res) => {
      try {
        const id = req.url.replace(/^\//, '')
        if (req.method === 'GET' && !id) {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(readAnnotations()))
          return
        }
        if (!IMAGE_ID.test(id)) {
          res.statusCode = 400
          res.end('bad image id')
          return
        }
        const data = readAnnotations()
        if (req.method === 'PUT') {
          const record = JSON.parse(await readBody(req))
          if (typeof record !== 'object' || record === null || Array.isArray(record)) throw new Error('record must be an object')
          data[id] = record
        } else if (req.method === 'DELETE') {
          delete data[id]
        } else {
          res.statusCode = 405
          res.end()
          return
        }
        writeAnnotations(data)
        res.statusCode = 204
        res.end()
      } catch (err) {
        res.statusCode = 500
        res.end(String(err))
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), annotationStore()],
})
