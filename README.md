# Zapzinho Básico

Um chat **bem simples**, sem login e sem segurança, para conversar em uma sala com seu amigo.

## Como usar

1. Abra o site.
2. Escolha um nome e uma sala.
3. Seu amigo entra com outro nome e **a mesma sala**.
4. Pronto, já podem trocar mensagens.

## Rodar localmente

Como é um projeto estático, basta abrir com qualquer servidor simples.

Exemplo com Python:

```bash
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Como colocar no GitHub (passo a passo)

No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPO.git
git push -u origin main
```

Depois no GitHub:

1. Crie um repositório vazio (sem README inicial).
2. Use a URL dele no comando `git remote add origin ...`.
3. Após o `git push`, confirme que os arquivos apareceram no repo.

## Publicar no GitHub Pages

1. Vá em **Settings > Pages**.
2. Em **Build and deployment**, escolha:
   - **Source:** Deploy from a branch
   - **Branch:** `main` (root)
3. Clique em **Save**.
4. Aguarde 1-3 minutos e abra a URL pública gerada pelo GitHub.

## Observação importante

Este projeto não tem autenticação, privacidade, criptografia ou proteção contra spam. Use apenas para testes/brincadeira.
