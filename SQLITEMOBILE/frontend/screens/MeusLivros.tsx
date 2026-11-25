// Tela principal: controla lista, busca, detalhes, cadastro, edição e exclusão dos livros.
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { BookOpen, Download, X } from 'lucide-react-native';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import {
  atualizarLivro,
  buscarLivro,
  excluirLivro,
  exportarBanco,
  inserirLivro,
  listarLivros,
} from '../../backend/services/livrosService';
import { GENEROS, TAMANHO_PAGINA } from '../../backend/models/Livro';
import type { FormularioLivro, Livro } from '../../backend/models/Livro';
import {
  paraFormulario,
  validarLivro,
} from '../../backend/validators/livroValidator';
import { Icon } from '../components/Icon';
import { T } from '../components/Typography';
import { Button } from '../components/Button';
import { Badge } from '../components/BookBadge';
import { Cover } from '../components/BookCover';
import { C } from '../styles/theme';
import { s } from '../styles/styles';
import { salvarBanco } from '../utils/salvarBanco';

const emptyForm: FormularioLivro = {
  titulo: '',
  autor: '',
  genero: '',
  ano: '',
  paginas: '',
  nota: '',
  anotacoes: '',
};
const emptyList = {
  livros: [] as Livro[],
  total: 0,
  totalGeral: 0,
  pagina: 1,
  paginas: 1,
};
export default function MeusLivros() {
  const [fonts, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [ready, setReady] = useState(false);
  const [fatal, setFatal] = useState('');
  const [screen, setScreen] = useState<'lista' | 'detalhes' | 'formulario'>(
    'lista',
  );
  const [data, setData] = useState(emptyList);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Livro | null>(null);
  const [editing, setEditing] = useState(false);
  const [origin, setOrigin] = useState<'lista' | 'detalhes'>('lista');
  const [form, setForm] = useState<FormularioLivro>(emptyForm);
  const [formError, setFormError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<Livro | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [genres, setGenres] = useState(false);
  const [focused, setFocused] = useState<
    keyof FormularioLivro | 'busca' | null
  >(null);
  const request = useRef(0);
  const mutation = useRef(false);

  const reload = useCallback(async (page: number, search: string) => {
    const ticket = ++request.current;
    setLoading(true);
    try {
      const result = await listarLivros(page, search);
      if (ticket === request.current) setData(result);
    } finally {
      if (ticket === request.current) setLoading(false);
    }
  }, []);

  const init = useCallback(async () => {
    setFatal('');
    try {
      await reload(1, '');
      setReady(true);
    } catch (e) {
      setFatal('Não foi possível abrir o banco de dados. ' + message(e));
    }
  }, [reload]);
  useEffect(() => {
    void init();
  }, [init]);
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(() => {
      void reload(1, query).catch((e) => setNotice(message(e)));
    }, 200);
    return () => clearTimeout(timer);
  }, [query, ready, reload]);
  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  const back = useCallback(() => {
    if (mutation.current) return;
    if (genres) {
      setGenres(false);
      return;
    }
    if (deleting) {
      setDeleting(null);
      return;
    }
    if (screen === 'formulario') setScreen(origin);
    else setScreen('lista');
    setFormError('');
  }, [genres, deleting, screen, origin]);
  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'lista' && !deleting && !genres) return false;
      back();
      return true;
    });
    return () => handler.remove();
  }, [screen, deleting, genres, back]);

  async function openBook(id: number, edit = false) {
    if (mutation.current) return;
    try {
      const livro = await buscarLivro(id);
      if (!livro) throw new Error('Livro não encontrado. Atualize a lista.');
      setSelected(livro);
      if (edit) {
        setForm(paraFormulario(livro));
        setEditing(true);
        setFormError('');
        setOrigin(screen === 'detalhes' ? 'detalhes' : 'lista');
        setScreen('formulario');
      } else setScreen('detalhes');
    } catch (e) {
      setNotice(message(e));
    }
  }
  function create() {
    if (mutation.current) return;
    setSelected(null);
    setForm({ ...emptyForm });
    setEditing(false);
    setFormError('');
    setOrigin('lista');
    setScreen('formulario');
  }
  async function save() {
    if (mutation.current) return;
    let livro;
    try {
      livro = validarLivro(form);
    } catch (e) {
      setFormError(message(e));
      return;
    }
    mutation.current = true;
    setBusy(true);
    setFormError('');
    let saved = false;
    try {
      const id =
        editing && selected
          ? (await atualizarLivro(selected.id, livro), selected.id)
          : await inserirLivro(livro);
      saved = true;
      setSelected({ ...livro, id });
      setScreen(editing && origin === 'detalhes' ? 'detalhes' : 'lista');
      setNotice(editing ? 'Alterações salvas.' : 'Livro cadastrado.');
      // Um cadastro volta à primeira página e remove o filtro anterior.
      if (!editing) setQuery('');
      await reload(editing ? data.pagina : 1, editing ? query : '');
    } catch (e) {
      if (saved)
        setNotice(
          'Livro salvo. Não foi possível atualizar a lista: ' + message(e),
        );
      else setFormError('Não foi possível salvar. ' + message(e));
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  }
  async function remove() {
    if (!deleting || mutation.current) return;
    mutation.current = true;
    setBusy(true);
    setDeleteError('');
    let removed = false;
    try {
      await excluirLivro(deleting.id);
      removed = true;
      setDeleting(null);
      setSelected(null);
      setScreen('lista');
      setNotice('Livro excluído.');
      await reload(data.pagina, query);
    } catch (e) {
      if (removed)
        setNotice('Livro excluído. Falha ao atualizar a lista: ' + message(e));
      else setDeleteError('Não foi possível excluir. ' + message(e));
    } finally {
      mutation.current = false;
      setBusy(false);
    }
  }
  function go(page: number) {
    void reload(page, query).catch((e) => setNotice(message(e)));
  }
  function confirmDelete(livro: Livro) {
    if (mutation.current) return;
    setDeleteError('');
    setDeleting(livro);
  }
  async function downloadDatabase() {
    if (mutation.current) return;
    mutation.current = true;
    setExporting(true);
    try {
      const bytes = await exportarBanco();
      setNotice(await salvarBanco(bytes));
    } catch (error) {
      setNotice('Não foi possível exportar o banco. ' + message(error));
    } finally {
      mutation.current = false;
      setExporting(false);
    }
  }
  function field(
    key: keyof FormularioLivro,
    label: string,
    placeholder: string,
    numeric = false,
    multiline = false,
  ) {
    return (
      <View style={[s.field, numeric && s.flex]}>
        <T style={s.label}>{label}</T>
        <TextInput
          accessibilityLabel={label}
          value={form[key]}
          onChangeText={(value) => {
            setForm((f) => ({ ...f, [key]: value }));
            setFormError('');
          }}
          onFocus={() => setFocused(key)}
          onBlur={() => setFocused(null)}
          placeholder={placeholder}
          placeholderTextColor={C.muted}
          editable={!busy}
          keyboardType={
            numeric
              ? key === 'nota'
                ? 'decimal-pad'
                : 'number-pad'
              : 'default'
          }
          multiline={multiline}
          maxLength={
            key === 'anotacoes'
              ? 2000
              : key === 'titulo'
                ? 150
                : key === 'autor'
                  ? 120
                  : key === 'ano'
                    ? 4
                    : 6
          }
          style={[
            s.input,
            multiline && s.textarea,
            focused === key && s.inputFocused,
          ]}
        />
      </View>
    );
  }

  if ((!fonts && !fontError) || !ready)
    return (
      <SafeAreaView style={s.root}>
        <StatusBar style="dark" />
        <View style={s.center}>
          {fatal ? (
            <>
              <T style={s.error}>{fatal}</T>
              <Button title="Tentar novamente" onPress={() => void init()} />
            </>
          ) : (
            <>
              <ActivityIndicator size="large" color={C.primary} />
              <T style={s.muted}>Abrindo sua biblioteca…</T>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  const pagesStart = Math.max(1, Math.min(data.pagina - 1, data.paginas - 2));
  const pageNumbers = Array.from(
    { length: Math.min(3, data.paginas) },
    (_, i) => pagesStart + i,
  );

  return (
    <SafeAreaView style={s.root}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={s.frame}>
          {screen === 'lista' ? (
            <>
              <View style={s.listHeader}>
                <View>
                  <T style={s.eyebrow}>BIBLIOTECA PESSOAL</T>
                  <T style={s.appTitle}>Meus livros</T>
                  <T style={s.subtitle}>
                    {data.totalGeral}{' '}
                    {data.totalGeral === 1
                      ? 'livro na estante'
                      : 'livros na estante'}
                  </T>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Novo livro"
                  disabled={exporting}
                  onPress={create}
                  style={({ pressed }) => [s.newButton, pressed && s.pressed]}
                >
                  <Icon name="plus" />
                  <T style={s.newText}>Adicionar</T>
                </Pressable>
              </View>
              <View style={[s.search, focused === 'busca' && s.inputFocused]}>
                <Icon name="search" />
                <TextInput
                  accessibilityLabel="Buscar por título ou autor"
                  placeholder="Buscar por título ou autor"
                  placeholderTextColor={C.muted}
                  value={query}
                  onChangeText={(value) => {
                    ++request.current;
                    setQuery(value);
                  }}
                  style={s.searchInput}
                  onFocus={() => setFocused('busca')}
                  onBlur={() => setFocused(null)}
                />
                {!!query && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Limpar busca"
                    hitSlop={8}
                    onPress={() => {
                      ++request.current;
                      setQuery('');
                    }}
                  >
                    <X size={16} color={C.muted} />
                  </Pressable>
                )}
              </View>
              <View style={s.listLabel}>
                <T style={s.listLabelText}>
                  {query ? 'Resultado da busca' : 'Na sua estante'}
                </T>
                <View style={s.listTools}>
                  <T style={s.listLabelCount}>
                    {data.total} {data.total === 1 ? 'livro' : 'livros'}
                  </T>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Exportar banco SQLite"
                    disabled={exporting}
                    onPress={() => void downloadDatabase()}
                    style={({ pressed }) => [
                      s.exportButton,
                      (exporting || pressed) && s.dim,
                    ]}
                  >
                    <Download size={14} color={C.primary} strokeWidth={1.7} />
                    <T style={s.exportText}>
                      {exporting ? 'Exportando…' : 'Exportar banco'}
                    </T>
                  </Pressable>
                </View>
              </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={s.list}
              >
                {data.livros.map((livro) => (
                  <View key={livro.id} style={s.card}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Ver detalhes de ${livro.titulo}`}
                      onPress={() => void openBook(livro.id)}
                      style={({ pressed }) => [
                        s.cardMain,
                        pressed && s.pressed,
                      ]}
                    >
                      <Cover livro={livro} />
                      <View style={s.cardContent}>
                        <T numberOfLines={1} style={s.cardTitle}>
                          {livro.titulo}
                        </T>
                        <T numberOfLines={1} style={s.author}>
                          {livro.autor}
                        </T>
                        <Badge livro={livro} />
                      </View>
                    </Pressable>
                    <View style={s.cardActions}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Editar ${livro.titulo}`}
                        hitSlop={4}
                        onPress={() => void openBook(livro.id, true)}
                        style={({ pressed }) => [
                          s.editIcon,
                          pressed && { backgroundColor: C.soft },
                        ]}
                      >
                        <Icon name="pencil" />
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Excluir ${livro.titulo}`}
                        hitSlop={4}
                        onPress={() => confirmDelete(livro)}
                        style={({ pressed }) => [
                          s.deleteIcon,
                          pressed && { backgroundColor: C.dangerSoft },
                        ]}
                      >
                        <Icon name="trash" />
                      </Pressable>
                    </View>
                  </View>
                ))}
                {data.total === 0 && (
                  <View style={s.empty}>
                    <BookOpen size={32} strokeWidth={1.3} color={C.muted} />
                    <T style={s.sectionTitle}>
                      {query
                        ? 'Nenhum livro encontrado'
                        : 'Sua estante está vazia'}
                    </T>
                    <T style={s.muted}>
                      {query
                        ? 'Tente outro título ou autor.'
                        : 'Adicione o primeiro livro à sua coleção.'}
                    </T>
                  </View>
                )}
                {loading && (
                  <ActivityIndicator
                    color={C.primary}
                    accessibilityLabel="Atualizando livros"
                  />
                )}
                <View style={s.pagination}>
                  <View style={s.pageRow}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Página anterior"
                      disabled={loading || data.pagina === 1}
                      onPress={() => go(data.pagina - 1)}
                      style={[s.pageButton, data.pagina === 1 && s.dim]}
                    >
                      <Icon name="left" />
                    </Pressable>
                    <View style={s.pageNumbers}>
                      {pageNumbers.map((page) => (
                        <Pressable
                          key={page}
                          accessibilityRole="button"
                          accessibilityLabel={`Página ${page}`}
                          accessibilityState={{
                            selected: page === data.pagina,
                          }}
                          disabled={loading}
                          onPress={() => go(page)}
                          style={[
                            s.pageButton,
                            page === data.pagina && s.activePage,
                          ]}
                        >
                          <T
                            style={[
                              s.pageText,
                              page === data.pagina && { color: 'white' },
                            ]}
                          >
                            {page}
                          </T>
                        </Pressable>
                      ))}
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Próxima página"
                      disabled={loading || data.pagina === data.paginas}
                      onPress={() => go(data.pagina + 1)}
                      style={[
                        s.pageButton,
                        data.pagina === data.paginas && s.dim,
                      ]}
                    >
                      <Icon name="right" />
                    </Pressable>
                  </View>
                  <T style={s.pageCaption}>
                    Página {data.pagina} de {data.paginas} · exibindo{' '}
                    {data.total ? (data.pagina - 1) * TAMANHO_PAGINA + 1 : 0}–
                    {Math.min(data.pagina * TAMANHO_PAGINA, data.total)} de{' '}
                    {data.total}
                  </T>
                </View>
              </ScrollView>
            </>
          ) : (
            <>
              <View style={s.header}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Voltar"
                  disabled={busy}
                  onPress={back}
                  style={s.back}
                >
                  <Icon name="left" />
                </Pressable>
                <T style={s.sectionTitle}>
                  {screen === 'detalhes'
                    ? 'Detalhes do livro'
                    : editing
                      ? 'Editar livro'
                      : 'Novo livro'}
                </T>
              </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={s.content}
              >
                {screen === 'detalhes' && selected ? (
                  <>
                    <View style={s.hero}>
                      <Cover livro={selected} large />
                      <T style={s.bookTitle}>{selected.titulo}</T>
                      <T style={s.muted}>{selected.autor}</T>
                      <Badge livro={selected} />
                    </View>
                    <View style={s.info}>
                      {[
                        ['Gênero', selected.genero],
                        ['Ano de publicação', selected.ano],
                        ['Páginas', selected.paginas],
                        ['Nota', selected.nota],
                      ].map(([label, value]) => (
                        <View style={s.infoRow} key={String(label)}>
                          <T style={s.infoLabel}>{label}</T>
                          <T style={s.infoValue}>{value}</T>
                        </View>
                      ))}
                    </View>
                    <View style={s.notes}>
                      <T style={s.label}>Anotações</T>
                      <T style={s.notesText}>
                        {selected.anotacoes || 'Nenhuma anotação adicionada.'}
                      </T>
                    </View>
                    <Button
                      title="Editar livro"
                      onPress={() => void openBook(selected.id, true)}
                    />
                    <Button
                      title="Excluir livro"
                      kind="softDanger"
                      onPress={() => confirmDelete(selected)}
                    />
                  </>
                ) : (
                  <>
                    <View style={s.form}>
                      {field('titulo', 'Título', 'Ex.: Dom Casmurro')}
                      {field('autor', 'Autor', 'Ex.: Machado de Assis')}
                      <View style={s.formRow}>
                        <View style={[s.field, s.flex]}>
                          <T style={s.label}>Gênero</T>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={`Gênero: ${form.genero || 'Selecione'}`}
                            disabled={busy}
                            onPress={() => setGenres(true)}
                            style={s.select}
                          >
                            <T
                              numberOfLines={1}
                              style={[s.selectText, !form.genero && s.muted]}
                            >
                              {form.genero || 'Selecione'}
                            </T>
                            <Icon name="down" />
                          </Pressable>
                        </View>
                        {field('ano', 'Ano', 'AAAA', true)}
                      </View>
                      <View style={s.formRow}>
                        {field('paginas', 'Páginas', '0', true)}
                        {field('nota', 'Nota (1 a 5)', '1 a 5', true)}
                      </View>
                      {field(
                        'anotacoes',
                        'Anotações',
                        'Escreva suas anotações...',
                        false,
                        true,
                      )}
                    </View>
                    {!!formError && (
                      <T accessibilityRole="alert" style={s.error}>
                        {formError}
                      </T>
                    )}
                    <View style={s.formButtons}>
                      <Button
                        title={
                          busy
                            ? 'Salvando…'
                            : editing
                              ? 'Salvar alterações'
                              : 'Salvar livro'
                        }
                        onPress={() => void save()}
                        disabled={busy}
                      />
                      <Button
                        title="Cancelar"
                        kind="secondary"
                        disabled={busy}
                        onPress={back}
                      />
                    </View>
                  </>
                )}
              </ScrollView>
            </>
          )}
          {!!notice && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar mensagem"
              onPress={() => setNotice('')}
              style={s.notice}
            >
              <T accessibilityLiveRegion="polite" style={s.noticeText}>
                {notice}
              </T>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
      <Modal
        visible={!!deleting}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!busy) setDeleting(null);
        }}
        statusBarTranslucent
      >
        <View style={s.overlay}>
          <View accessibilityViewIsModal style={s.dialog}>
            <View style={s.deleteCircle}>
              <Icon name="trash-large" />
            </View>
            <T style={s.dialogTitle}>Excluir livro?</T>
            <T style={s.dialogText}>
              “{deleting?.titulo}” será retirado da sua estante. Essa ação não
              pode ser desfeita.
            </T>
            {!!deleteError && (
              <T accessibilityRole="alert" style={s.error}>
                {deleteError}
              </T>
            )}
            <View style={s.dialogActions}>
              <View style={s.flex}>
                <Button
                  title="Cancelar"
                  kind="secondary"
                  disabled={busy}
                  onPress={() => setDeleting(null)}
                />
              </View>
              <View style={s.flex}>
                <Button
                  title={busy ? 'Excluindo…' : 'Excluir'}
                  kind="danger"
                  disabled={busy}
                  onPress={() => void remove()}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={genres}
        transparent
        animationType="fade"
        onRequestClose={() => setGenres(false)}
      >
        <View style={s.overlay}>
          <View accessibilityViewIsModal style={s.genreDialog}>
            <T style={s.sectionTitle}>Selecione o gênero</T>
            <ScrollView
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
            >
              {GENEROS.map((genero) => (
                <Pressable
                  key={genero}
                  accessibilityRole="button"
                  onPress={() => {
                    setForm((f) => ({ ...f, genero }));
                    setFormError('');
                    setGenres(false);
                  }}
                  style={[
                    s.genreOption,
                    form.genero === genero && { backgroundColor: C.soft },
                  ]}
                >
                  <T>
                    {genero}
                    {form.genero === genero ? ' ✓' : ''}
                  </T>
                </Pressable>
              ))}
            </ScrollView>
            <Button
              title="Cancelar"
              kind="secondary"
              onPress={() => setGenres(false)}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
function message(error: unknown) {
  return error instanceof Error ? error.message : 'Tente novamente.';
}
