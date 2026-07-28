export function exportContent(content: string, filename: string, format: "text" | "markdown" | "html" = "text") {
  let data: string;
  let mimeType: string;
  let ext: string;

  switch (format) {
    case "markdown":
      data = content;
      mimeType = "text/markdown";
      ext = "md";
      break;
    case "html":
      data = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${filename}</title><style>body{font-family:system-ui;max-width:800px;margin:40px auto;padding:20px;line-height:1.6;color:#333}h1,h2,h3{color:#1a1a1a}pre{background:#f5f5f5;padding:16px;border-radius:8px;overflow-x:auto}blockquote{border-left:4px solid #7c3aed;padding-left:16px;color:#666}</style></head><body>${contentToHtml(content)}</body></html>`;
      mimeType = "text/html";
      ext = "html";
      break;
    default:
      data = content;
      mimeType = "text/plain";
      ext = "txt";
  }

  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

function contentToHtml(content: string): string {
  return content
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) return `<h1>${line.slice(2)}</h1>`;
      if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith("- ")) return `<li>${line.slice(2)}</li>`;
      if (line.startsWith("**") && line.endsWith("**"))
        return `<strong>${line.slice(2, -2)}</strong>`;
      if (line.trim() === "") return "<br>";
      return `<p>${line}</p>`;
    })
    .join("\n");
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
