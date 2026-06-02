# Meu App Mobile

App mobile criado com **React Native**, **JavaScript** e estilos no padrão **StyleSheet** (similar a CSS).

## Estrutura do projeto

- `App.js` – componente principal e navegação entre telas
- `src/screens/` – telas: Home, Lista, Perfil
- `src/components/` – componentes reutilizáveis (ex.: Header)
- `src/styles/globalStyles.js` – estilos globais (CSS-like)

## Pré-requisitos

- **Node.js** (LTS) instalado: [nodejs.org](https://nodejs.org)
- **Expo Go** no celular (opcional): [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) ou App Store

## Como rodar

1. Abra o terminal na pasta do projeto:
   ```bash
   cd MeuAppMobile
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o projeto:
   ```bash
   npx expo start
   ```

4. No celular: escaneie o QR code com o app **Expo Go** (ou use o emulador Android/iOS conforme as opções no terminal).

## Tecnologias

- **React Native** – interface nativa
- **Expo** – ferramentas e build
- **JavaScript** – lógica e componentes
- **StyleSheet** – estilos (flexbox, cores, fontes – sintaxe próxima de CSS)

## Telas

- **Home** – boas-vindas e botões para Lista, Tarefas e Perfil
- **Lista** – lista de itens em cards
- **Minhas Tarefas** – adicionar, marcar e excluir tarefas
- **Perfil** – campo de texto e saudação com o nome

## Subir para o GitHub

1. Instale o [Git](https://git-scm.com/download/win) se ainda não tiver.
2. Crie um repositório novo no [GitHub](https://github.com/new) (vazio, sem README).
3. No terminal (CMD ou PowerShell), na pasta do projeto:

   ```bash
   git init
   git add .
   git commit -m "Primeiro commit: Meu App Mobile com Expo SDK 54"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```

   Troque `SEU_USUARIO` e `SEU_REPOSITORIO` pelo seu usuário e nome do repositório no GitHub.

Se não tiver Node/npx no PATH, instale o Node.js e use o terminal na pasta do projeto para `npm install` e `npx expo start`.
