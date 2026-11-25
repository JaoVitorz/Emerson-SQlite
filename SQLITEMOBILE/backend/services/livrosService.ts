// Expõe ao frontend operações simples que obtêm a conexão e delegam ao repositório.
import { Banco } from '../database/connection.ts';
import * as repository from '../repositories/livrosRepository.ts';
import type { DadosLivro } from '../models/Livro.ts';

// A interface usa este serviço; a conexão e o SQL ficam dentro do backend local.
export async function listarLivros(pagina = 1, busca = '') {
  return repository.listarLivros(await Banco(), pagina, busca);
}
export async function buscarLivro(id: number) {
  return repository.buscarLivro(await Banco(), id);
}
export async function inserirLivro(livro: DadosLivro) {
  return repository.inserirLivro(await Banco(), livro);
}
export async function atualizarLivro(id: number, livro: DadosLivro) {
  return repository.atualizarLivro(await Banco(), id, livro);
}
export async function excluirLivro(id: number) {
  return repository.excluirLivro(await Banco(), id);
}

// Exporta uma imagem completa do banco aberto, incluindo os registros atuais.
export async function exportarBanco() {
  return (await Banco()).serializeAsync();
}
