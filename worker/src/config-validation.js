function validateWranglerCandidate(source) {
  if (typeof source !== "string" || source.length > 16000) return {ok:false,reason:"invalid_size"};
  const allowedSections = new Set(["root","observability","d1_databases","triggers","ai"]);
  const seen = new Set();
  let section = "root";
  const required = new Set(["root.name","root.main","root.compatibility_date","observability.enabled","d1_databases.binding","d1_databases.database_name","d1_databases.database_id","triggers.crons","ai.binding"]);
  for (const rawLine of source.replace(/\r\n/g,"\n").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const header = line.match(/^\[\[([a-z0-9_]+)\]\]$|^\[([a-z0-9_]+)\]$/);
    if (header) {
      section = header[1] === "d1_databases" ? "d1_databases" : header[2];
      if (!allowedSections.has(section) || section === "root") return {ok:false,reason:"unknown_section"};
      continue;
    }
    const pair = line.match(/^([a-z0-9_]+)\s*=\s*(.+)$/);
    if (!pair) return {ok:false,reason:"invalid_line",line};
    const key = section + "." + pair[1];
    if (seen.has(key)) return {ok:false,reason:"duplicate_key"};
    seen.add(key);
    const value = pair[2];
    const valid =
      (key === "root.name" && value === '"central-ia-worker"') ||
      (key === "root.main" && value === '"src/index.js"') ||
      (key === "root.compatibility_date" && /^"\d{4}-\d{2}-\d{2}"$/.test(value) && value === '"2026-11-19"') ||
      (key === "observability.enabled" && /^(true|false)$/.test(value)) ||
      (key === "d1_databases.binding" && value === '"DB"') ||
      (key === "d1_databases.database_name" && value === '"central-ia-db"') ||
      (key === "d1_databases.database_id" && value === '"59f3056f-c6a2-4c95-9d1e-2ba9aad2091a"') ||
      (key === "triggers.crons" && (() => { try { const list=JSON.parse(value); return Array.isArray(list) && list.length>=1 && list.length<=10 && list.every(x=>typeof x==="string" && x.length<=80); } catch { return false; } })()) ||
      (key === "ai.binding" && value === '"AI"');
    if (!valid) return {ok:false,reason:"unsupported_or_invalid_value",key};
  }
  const missing=[...required].filter(key=>!seen.has(key));
  return missing.length ? {ok:false,reason:"missing_required_keys",missing} : {ok:true};
}

export { validateWranglerCandidate };
