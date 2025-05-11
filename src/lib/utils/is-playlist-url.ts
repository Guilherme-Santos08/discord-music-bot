/**
 * Retorna true se a URL contém o parâmetro 'list=', indicando uma playlist do YouTube.
 */
export function isPlaylistUrl(url: string): boolean {
  return /[?&]list=([a-zA-Z0-9_-]+)/.test(url);
}
