// Implementação web: gera um download do banco SQLite no navegador.
export async function salvarBanco(bytes: Uint8Array) {
  const blob = new Blob([Uint8Array.from(bytes).buffer], {
    type: 'application/vnd.sqlite3',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'MeusLivros.db';
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    // Mantém a URL disponível até o navegador iniciar o download.
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
  return 'Download de MeusLivros.db iniciado.';
}
