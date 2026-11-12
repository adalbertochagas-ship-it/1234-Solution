# Adalberto Chagas Academy: Estrutura do Site e Guia de Deploy

Estrutura institucional estática de alta performance para a Adalberto Chagas Academy, otimizada para publicação direta em servidores web (Apache, LiteSpeed, NGINX) e compatível com hospedagens WordPress via File Manager (cPanel, DirectAdmin, Plesk ou hPanel).

---

## 1. Visão Geral das Páginas

O site é composto por três páginas principais e uma página de política institucional, operando em HTML5 semântico, CSS puro e JavaScript moderno com suporte a GSAP e ScrollTrigger:

| Página | Arquivo Local | Rota de Produção | Função |
| :--- | :--- | :--- | :--- |
| **Home** | `academy/index.html` | `/` | Apresentação institucional, dobras de autoridade, pilares de mentoria e chamadas de ação. |
| **Diagnóstico** | `academy/diagnostico/index.html` | `/diagnostico/` | Questionário detalhado de liderança, VSL explicativa e qualificação de perfil. |
| **Obrigado** | `academy/obrigado/index.html` | `/obrigado/` | Confirmação de recebimento, próximos passos técnicos e evento de conversão via dataLayer. |
| **Privacidade** | `academy/privacidade.html` | `/privacidade.html` | Termos e política de privacidade conforme as diretrizes da LGPD. |

---

## 2. Estrutura de Diretórios do Repositório

```text
site-geral-ac-academy/
├── academy/                   # PACOTE DE PRODUÇÃO (arquivos que vão para o servidor)
│   ├── index.html             # Página inicial (Home)
│   ├── privacidade.html       # Política de Privacidade
│   ├── .htaccess              # Regras de servidor (Apache/LiteSpeed, MIME types, cache e rotas)
│   ├── diagnostico/
│   │   └── index.html         # Página do Diagnóstico de Liderança
│   ├── obrigado/
│   │   └── index.html         # Página de confirmação de envio do questionário
│   └── assets/                # Arquivos estáticos em produção (29 itens)
│       ├── ac-symbol.png
│       ├── apple-touch-icon.png
│       ├── consent.css / .js  # Módulo de consentimento e cookies LGPD
│       ├── favicon*.png / .ico
│       ├── hero.mp4 / hero_mobile.mp4 / hero_poster.jpg
│       ├── ilu-*.webp         # Ilustrações técnicas em formato WebP
│       └── retrato-*.webp     # Fotografias otimizadas
├── templates/                 # Templates de apoio e documentação visual
│   ├── design_system2.html    # Guia do Design System (tokens, tipografia, paleta e botões)
│   └── (demais referências)
├── raw_assets/                # Arquivos brutos de origem e scripts de apoio
│   ├── hero_3.mp4
│   ├── hero_mobile_3.mp4
│   ├── hero_poster_3.jpg
│   ├── Logotipo 2 - AC Academy (1).png
│   └── extract.py
├── assets/                    # Arquivos legados de iterações anteriores
├── deploy-wordpress.zip       # Pacote pronto para upload e extração direta no WordPress
├── .gitignore                 # Filtro de arquivos de sistema, logs e temporários
└── README.md                  # Documentação técnica e operacional
```

---

## 3. Guia de Deploy no WordPress via File Manager

Para publicar as páginas na hospedagem WordPress sem conflitos com o tema ou plugins:

### Passo 1: Localizar o Diretório Raiz
1. Acesse o painel de controle da sua hospedagem (cPanel, Plesk, hPanel ou DirectAdmin).
2. Abra o **File Manager** (Gerenciador de Arquivos).
3. Navegue até o diretório raiz da instalação do WordPress, normalmente denominado `public_html/` ou `www/` (onde ficam as pastas `wp-content`, `wp-includes` e `wp-admin`).

### Passo 2: Upload do Pacote
1. Envie o arquivo `deploy-wordpress.zip` para dentro de `public_html/`.
2. Clique com o botão direito sobre o arquivo `deploy-wordpress.zip` e selecione **Extract** (Extrair).
3. Certifique-se de que o conteúdo foi extraído mantendo a estrutura:
   - `index.html` (ou inserido no subdiretório desejado caso não substitua a Home do tema)
   - `diagnostico/index.html`
   - `obrigado/index.html`
   - `privacidade.html`
   - pasta `assets/`
   - `.htaccess`
4. Exclua o arquivo `.zip` da hospedagem após a extração.

### Passo 3: Configuração do `.htaccess`
O arquivo `academy/.htaccess` fornecido no projeto contém as diretivas necessárias para:
- Atribuir prioridade a arquivos `index.html` estáticos sobre o `index.php` do WordPress (`DirectoryIndex index.html index.php`).
- Ativar tipos MIME corretos para vídeos MP4 (`video/mp4`), imagens WebP (`image/webp`) e fontes WOFF2 (`font/woff2`).
- Impedir que o mecanismo de URLs amigáveis do WordPress intercepte e redirecione requisições válidas para as subpastas estáticas (`/diagnostico/` e `/obrigado/`).
- Habilitar compressão GZIP e cabeçalhos de cache para carregamento ultra rápido.

---

## 4. Integração de Eventos e Analytics

A página `/obrigado/index.html` possui disparo automático de conversão para o Google Tag Manager / GA4 via `window.dataLayer`:

- **Nome do Evento**: `diagnostico_questionario_concluido`
- **Mecanismo de Proteção**: Utiliza `sessionStorage` com chave exclusiva para evitar contagem duplicada quando o usuário atualiza (F5) ou revisita a página na mesma sessão de navegação.

---

## 5. Manutenção e Padrões de Código

- **Design System**: Consulte `templates/design_system2.html` para consultar a paleta (Deep Navy `#0b1320`, Paper `#f7f5f0`, Ouro `#c5a059`), escalas de espaçamento e regras tipográficas (Fraunces, IBM Plex Sans, IBM Plex Mono).
- **Caminhos Relativos**: Todas as três páginas utilizam links e assets relativos (`assets/...`, `diagnostico/`, `../`, etc.), permitindo que funcionem tanto na raiz do domínio quanto em qualquer subdiretório sem necessidade de reconfiguração de URL.

