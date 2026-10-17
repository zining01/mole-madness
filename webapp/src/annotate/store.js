// Talks to the dev-server endpoint in vite.config.js, which reads and writes
// src/data/annotations.json. Only available under `npm run dev`.

const ENDPOINT = '/__annotations';

const check = async (res) => {
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res;
};

export const loadAnnotations = async () => (await check(await fetch(ENDPOINT))).json();

// Model second opinions keyed by image id; {} when none have been generated.
// run: 'web' (600-px images, the default) or 'hires' (full-resolution originals).
export const loadSuggestions = async (run = 'web') => (await check(await fetch(`/__suggestions/${run}`))).json();

export const saveAnnotation = async (id, record) =>
  check(
    await fetch(`${ENDPOINT}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    })
  );

export const deleteAnnotation = async (id) => check(await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' }));
