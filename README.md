# 🎟️ EventPass — Plataforma de Ingressos & Experiências Digitais

> Front-End moderno, responsivo e seguro construído com **React**, **TypeScript**, **Vite** e **Material UI (MUI)**, projetado com máxima fidelidade aos layouts do **Figma**, suporte completo a Desktop e Mobile, e integração completa com a API REST.

---

## 📸 Identidade Visual & Design System

O projeto adota uma estética **Dark Neon & Cyber-Elegance** de alto padrão visual:
- **Tema Base**: Dark mode imersivo (`#0B0F19` e `#121927`) com bordas sutis (`#1E293B`).
- **Acentos e Gradientes**: Gradiente Ciano Neon (`#00D2FF`) para Roxo Elétrico (`#8B5CF6`).
- **Tipografia**: *Plus Jakarta Sans* e *Inter* para máxima legibilidade e hierarquia tipográfica.
- **Responsividade Total**:
  - **Desktop**: Grid expandido, mapa de assentos com palco curvado luminoso, barra lateral flutuante de resumo e dashboard do organizador com tabela completa e gráficos.
  - **Mobile**: Menu *Drawer* lateral retrátil, mapa de assentos com rolagem horizontal suave e zoom amigável ao toque, cartões de ingresso em formato de passe digital vertical e cards responsivos no painel do organizador.

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Finalidade |
| :--- | :--- |
| **React 18** | Biblioteca base para construção da interface de usuário declarativa e reativa. |
| **TypeScript** | Tipagem estática rigorosa para garantir estabilidade, autocomplete e zero erros de runtime. |
| **Vite 5** | Bundler de última geração com inicialização instantânea e *Hot Module Replacement* (HMR). |
| **Material UI (MUI v6)** | Componentes acessíveis e customizados via tema Dark (`@mui/material`, `@emotion/react`, `@emotion/styled`). |
| **Lucide Icons** | Conjunto moderno e consistente de ícones vetoriais (`lucide-react`). |
| **React Router Dom (v6)** | Gerenciamento de rotas SPA e proteção com *Route Guards* por perfil. |
| **Axios** | Cliente HTTP com interceptor para injeção automática de JWT e tratamento de erros 400/401/403. |
| **html5-qrcode** | Leitor de câmera em tempo real para escaneamento de QR Code na portaria. |
| **qrcode.react** | Renderizador SVG de QR Code criptográfico de alta fidelidade para ingressos digitais. |
| **Notistack** | Sistema moderno de notificações *Toast* para feedback instantâneo ao usuário. |
| **jwt-decode** | Decodificação segura do payload de tokens JWT para gerenciamento de sessão. |
| **canvas-confetti** | Efeito visual de celebração na aprovação de pagamentos. |

---

## 🚀 Passo a Passo para Configurar e Executar

### Pré-requisitos
- **Node.js** v18+ ou v20+ (LTS recomendado).
- **NPM** v9+ ou gerenciador compatível.
- **API Backend** rodando em `http://localhost:8080`.

### 1. Clonar o repositório e entrar na pasta
```bash
git clone <URL_DO_REPOSITORIO>
cd plataforma-ingressos-frontend
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Executar o servidor de desenvolvimento
```bash
npm run dev
```

A aplicação será iniciada e estará acessível em:
👉 **`http://localhost:3000`**

### 4. Build de Produção e Validação de Tipos
Para validar os tipos TypeScript e gerar a pasta otimizada `dist/`:
```bash
npm run build
npm run preview
```

---

## 🌐 Conexão com o Backend & Documentação da API

- **Base URL da API**: `http://localhost:8080` (configurável via variável de ambiente `VITE_API_URL`)
- **Documentação Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **JSON OpenAPI**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 👥 Credenciais Pré-Cadastradas para Testes

O front-end conta com um **Acesso Rápido de Testes** (disponível no modal de Login e no menu de perfil do Navbar), permitindo alternar de perfil com apenas 1 clique:

| Perfil | E-mail | Senha | Funcionalidades para Testar |
| :--- | :--- | :--- | :--- |
| **ORGANIZER** | `organizador@eventos.com` | `senha123456` | Criar eventos com assentos ou pista, busca no TMDb, ver dashboard com gráficos, cancelar eventos e escalar porteiros. |
| **CLIENT (1)** | `cliente1@eventos.com` | `senhaSegura123` | Reservar assentos marcados/pista, cronômetro de 10 min, checkout simulado, carteira digital com QR Code e link de compartilhamento. |
| **CLIENT (2)** | `cliente2@eventos.com` | `senhaSegura123` | Testar concorrência simultânea e disputa de assentos em tempo real. |
| **PORTER** | `portaria@eventos.com` | `porteiroSenha123` | Leitor de câmera ao vivo, digitação manual de código, 4 estados visuais de resposta e estatísticas de presença em tempo real. |

---

## 🌟 Principais Recursos & Fluxos Implementados

### 1. 🎟️ Carteira Digital & Simulação de Check-in em 1 Clique (Sandbox)
* **Visualização Dinâmica de Status**: Diferenciação visual entre ingressos ativos (`ASSENTO RESERVADO` / `INGRESSO DIGITAL`) e utilizados (`ACESSO JÁ REGISTRADO`).
* **Modal de Simulação de Portaria**: Botão `🧪 Validar como Portaria` / `🧪 Testar Bloqueio (Portaria)` que abre modal explicativo, alterna a sessão para o perfil de portaria (`Lucas Porteiro`) e redireciona para a tela de check-in com validação automática imediata.
* **Aba Histórico com Status de Arquivamento**: Exibe `EVENTOS ANTERIORES` e card `Ingresso Utilizado & Arquivado`.
* **Tratamento Inteligente de Perfil**: Usuários conectados como Organizador ou Portaria ao acessarem `/my-tickets` recebem um painel orientativo com atalhos para seus respectivos painéis e botão de alternar para cliente em 1 clique.

### 2. 💺 Mapa Interativo de Assentos & Retorno Seguro
* **Mapa de Poltronas**: Seleção intuitiva de assentos com feedback visual (Disponível, Selecionado, Ocupado/Vendido).
* **Preservação de Escolha ao Voltar**: Ao retornar do Checkout para o mapa (seja pelo botão *"Voltar para o mapa"* ou pelas setas do navegador), a reserva pendente anterior é cancelada no banco e os assentos voltam pré-selecionados para permitir nova edição pelo cliente.

### 3. 📊 Painel do Produtor Adaptativo (Desktop & Mobile)
* **Mobile (< md)**: Cards verticais fluidos com barra de progresso de vendas, status e botões de ação touch-friendly.
* **Desktop (>= md)**: Tabela completa com paginação e rolagem horizontal segura.
* **Gráfico de Tendência de Vendas**: Visualização diária dos últimos 7 dias de receita e ingressos emitidos.

### 4. 🔍 Busca Global & Limpeza de Filtros Sincronizada
* **Input com Botão `X`**: Limpeza rápida direta no campo de busca.
* **Limpeza Unificada**: Botão *"Limpar Filtros"* reseta simultaneamente filtros de categoria/tipo e o texto pesquisado na URL e na barra de navegação.

---

## 🗺️ Mapeamento de Rotas & Permissões (Route Guards)

| Rota Front-End | Nível de Acesso | Descrição da Tela |
| :--- | :--- | :--- |
| `/` | **Público** | Home com Hero Banners, filtros por categoria (Filmes, Shows, Teatro) e busca global sincronizada. |
| `/events/:id` | **Público** | Detalhes do evento com mapa interativo de assentos numerados ou seletor de pista. |
| `/tickets/share/:shareToken` | **Público** | Bilhete digital público para convidados abrirem no celular sem login. |
| `/checkout/:reservationId` | **Cliente** (`CLIENT`, `ORGANIZER`, `PORTER`) | Checkout com cronômetro de 10 min, métodos de pagamento e painel de simulação. |
| `/my-tickets` | **Cliente** (`CLIENT`, `ORGANIZER`, `PORTER`) | Carteira de ingressos ativos e histórico com QR Code SVG criptografado e simulador de check-in. |
| `/organizer` | **Organizador** (`ORGANIZER`) | Dashboard com métricas de receita, vendas, gráficos e gerenciamento de eventos (Desktop e Mobile). |
| `/organizer/events/new` | **Organizador** (`ORGANIZER`) | Criação guiada de eventos com busca no TMDb/Ticketmaster e pré-visualização em tempo real. |
| `/portaria` | **Portaria** (`PORTER`, `ORGANIZER`) | Validador de ingressos com leitor de câmera, digitação manual, auto-validação por URL e estatísticas ao vivo. |

---

## 🛡️ Camadas e Diretrizes de Segurança Implementadas

O front-end foi construído seguindo as melhores práticas de segurança:

1. **Prevenção contra Cross-Site Scripting (XSS)**:
   - Bloqueio de protocolos perigosos em URLs e imagens (`javascript:`, `vbscript:`, etc.).
   - Zero uso de `dangerouslySetInnerHTML` com entradas não confiáveis.
2. **Validação Rigorosa de Formulários**:
   - Validação de formato de e-mail e regras de força de senha no lado do cliente antes do envio.
   - Bloqueio de submissão duplicada (*double-submit protection*) durante requisições assíncronas.
3. **Proteção de Dados Sensíveis**:
   - Campos de senha com `type="password"`, `autocomplete` apropriado e alternância de visualização.
   - Ocultação de dados confidenciais e CPF em links de compartilhamento público.
4. **Gerenciamento Seguro de JWT & Sessão**:
   - Verificação de expiração do token no cliente com auto-logout em caso de token expirado.
   - Limpeza automática de tokens em caso de respostas `401 Unauthorized` ou `403 Forbidden`.
   - *Route Guards* que impedem acesso indevido e vazamento de telas privadas.
5. **Meta Tags de Segurança no HTML**:
   - `X-Content-Type-Options: nosniff`
   - `Referrer-Policy: strict-origin-when-cross-origin`

---

## 📁 Estrutura de Pastas do Projeto

```
plataforma-ingressos-frontend/
├── Figma/                     # Telas de referência exportadas do Figma
├── public/                    # Favicon e logo SVG
├── src/
│   ├── api/                   # Módulos de integração com a API REST
│   │   ├── client.ts          # Instância Axios, interceptors e tratamento de erros
│   │   ├── auth.ts            # Login, cadastro e listagem de porteiros
│   │   ├── events.ts          # CRUD de eventos e escalação de equipe
│   │   ├── catalog.ts         # Integração externa TMDb / Ticketmaster
│   │   ├── reservations.ts    # Criação e cancelamento de reservas
│   │   ├── payments.ts        # Processamento e simulação de pagamentos
│   │   ├── tickets.ts         # Carteira de ingressos e link público
│   │   └── checkin.ts         # Validação de QR Code e estatísticas
│   ├── components/            # Componentes reutilizáveis
│   │   ├── auth/              # Modal de Login & Cadastro com atalhos de teste
│   │   ├── checkout/          # Temporizador regressivo de 10 min e simulação
│   │   ├── common/            # Navbar responsiva, Footer, ProtectedRoute, LoadingSpinner
│   │   ├── events/            # Cards de evento, Seletor de Pista e Mapa de Assentos
│   │   ├── organizer/         # Diálogo de escalação de portaria e LivePreviewCard
│   │   └── tickets/           # DigitalTicketCard com QR Code e Modal de Simulação
│   ├── context/               # AuthContext para autenticação e troca rápida de perfis
│   ├── pages/                 # Páginas da aplicação SPA
│   ├── theme/                 # Tema customizado Material UI (Dark Neon)
│   ├── types/                 # Definições de tipos TypeScript
│   └── utils/                 # Formatadores de moeda/data e funções de segurança
├── package.json
├── tsconfig.json
└── vite.config.ts
```
