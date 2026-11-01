// Строит публичный URL файла на диске "public" бэкенда (storage/app/public/<path>)
// по относительному пути, который отдаёт API (например "resources/2026/09/03/xxx.pdf").
export function storageUrl(path: string): string {
  const apiBase = import.meta.env.VITE_API_BASE_URL || ''
  // Убираем ТОЛЬКО завершающий "/api" (а не первое вхождение "/api" где-либо в строке —
  // на проде домен API называется "api.kuttuu-bilim.edu.kg", и .replace('/api','') по ошибке
  // вырезал "/api" из "https://api...", а не из хвоста, ломая итоговый URL).
  const origin = apiBase.replace(/\/api\/?$/, '')
  return `${origin}/storage/${path.replace(/^public\//, '')}`
}
