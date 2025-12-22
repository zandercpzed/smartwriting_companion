# 📋 SmartWrite Companion - Release Notes

**Plugin para Obsidian** - Assistente editorial local-first para autores de ficção

---

## 📊 **Visão Geral das Versões**

| Versão | Data | Tipo | Descrição |
|--------|------|------|-----------|
| [0.3.1](#031---21-dezembro-2025) | 21 Dez 2025 | Initial | Configuração inicial e recursos básicos |
| [0.1.7](#017---21-dezembro-2025) | 21 Dez 2025 | Patch | Otimizações de performance e reset de sessão |
| [0.1.6](#016---21-dezembro-2025) | 21 Dez 2025 | Patch | Correções de espaçamento e configuração |
| [0.1.5](#015---21-dezembro-2025) | 21 Dez 2025 | Patch | Melhorias na interface e detecção de parágrafos |
| [0.1.4](#014---21-dezembro-2025) | 21 Dez 2025 | Patch | Correções de interface e versionamento |
| [0.1.3](#013---21-dezembro-2025) | 21 Dez 2025 | Patch | Correções de espaçamento e layout |
| [0.1.2](#012---21-dezembro-2025) | 21 Dez 2025 | Patch | Sistema de versionamento automático |
| [0.1.1](#011---21-dezembro-2025) | 21 Dez 2025 | Minor | Funcionalidades básicas implementadas |
| [0.1.0](#010---21-dezembro-2025) | 21 Dez 2025 | Initial | Estrutura inicial do plugin |

---

## 🔄 **0.3.1** - 21 de dezembro de 2025

### 🚀 **Configuração Inicial**
- Estrutura fundamental criada para o plugin SmartWrite Companion.
- Componentes de acordeão modulares adicionados para a barra lateral.
- `BasePanel` implementado para comportamento consistente do painel.
- `styles.css` projetado para a barra lateral.
- `manifest.json` adicionado com metadados do plugin.

---

## 🔄 **0.1.7** - 21 de dezembro de 2025

### 🚀 **Novas Funcionalidades**
- **Botão Reset Session Time**: Permite zerar o tempo da sessão atual mantendo a contagem de palavras
- **Sistema de Cache Inteligente**: Otimização radical de performance para contagem instantânea

### 🔧 **Melhorias Técnicas**
- **Performance Otimizada**: Implementado cache de conteúdo e estatísticas para evitar recálculos desnecessários
- **Updates Seletivos**: Método `updateSessionTimeOnly()` para updates rápidos apenas do tempo
- **Redução de I/O**: Eliminação de leituras desnecessárias do sistema de arquivos

### 🎨 **Melhorias de UX**
- **Botão de Reset**: Interface intuitiva no painel de configurações com feedback visual
- **Notificações**: Confirmação ao resetar o tempo da sessão
- **Responsividade**: Contagem instantânea de palavras e caracteres

### 🐛 **Correções**
- **Performance de Contagem**: Resolvido delay na atualização de contadores
- **Feedback Visual**: Melhor experiência durante digitação

---

## 🔄 **0.1.6** - 21 de dezembro de 2025

### 🚀 **Novas Funcionalidades**
- **Configuração da Meta Diária**: Campo numérico para definir palavras por dia
- **Non-Break Space**: Espaçamento adequado entre labels e valores
- **Tempo desde Abertura**: Cronômetro inicia quando documento é aberto

### 🔧 **Melhorias Técnicas**
- **SessionTracker API**: Novos métodos `getGoal()` e `setGoal()`
- **Persistência**: Configurações salvas automaticamente
- **Unicode Support**: Non-break spaces (`\u00A0`) para formatação adequada

### 🎨 **Melhorias de UX**
- **Painel de Configurações Expandido**: Seção dedicada para meta diária
- **Input Numérico**: Campo com validação (1-10000 palavras)
- **Espaçamento Consistente**: Labels e valores com separação adequada

### 🐛 **Correções**
- **Espaçamento de Labels**: "Session time 5 min" em vez de "Session time5 min"
- **Cronômetro Preciso**: Tempo contado desde abertura do documento
- **WPM em Tempo Real**: Atualização contínua das palavras por minuto

---

## 🔄 **0.1.5** - 21 de dezembro de 2025

### 🚀 **Novas Funcionalidades**
- **Detecção de Bullets e Listas**: Reconhecimento automático de parágrafos em listas
- **Layout conforme Protótipo**: Interface idêntica ao design aprovado

### 🔧 **Melhorias Técnicas**
- **Regex Aprimorado**: Detecção de bullets (`-`, `*`, `+`) e listas numeradas (`1.`, `2.`)
- **Estrutura HTML Otimizada**: Classes `.metrics-list`, `.metric-row`, `.metric-indent`
- **CSS Modular**: Separação de "Characters" e "No spaces" em linhas distintas

### 🎨 **Melhorias de UX**
- **Layout Consistente**: Interface conforme protótipo do Figma
- **Hierarquia Visual**: Indentação para itens relacionados
- **Espaçamento Adequado**: Gap de 6px conforme design

### 🐛 **Correções**
- **Detecção de Parágrafos**: Bullets e listas agora contam como parágrafos separados
- **Layout de Métricas**: Estrutura visual melhorada para readability

---

## 🔄 **0.1.4** - 21 de dezembro de 2025

### 🚀 **Novas Funcionalidades**
- **Sistema de Versionamento Automático**: Incremento automático do último dígito
- **Build Automatizado**: Script `bump-version` integrado ao processo de build

### 🔧 **Melhorias Técnicas**
- **NPM Scripts**: `bump-version` executado automaticamente no build
- **Versionamento Consistente**: Sincronização entre `manifest.json` e `package.json`
- **Regra de Versionamento**: Último dígito incrementado a cada interação

### 🎨 **Melhorias de UX**
- **Deploy Automático**: Build único atualiza versão e instala plugin
- **Feedback de Build**: Confirmação visual da nova versão

### 📋 **Documentação**
- **VERSION_RULES.md**: Documentação das regras de versionamento
- **Processo Padronizado**: Workflow consistente para releases

---

## 🔄 **0.1.3** - 21 de dezembro de 2025

### 🎨 **Melhorias de UX**
- **Correção de Espaçamento**: Gap entre setas e títulos ajustado para 5px
- **Layout de Sidebar**: Ajustes visuais para consistência

### 🐛 **Correções**
- **Espaçamento Visual**: Correção do gap no componente fold/unfold
- **Alinhamento**: Elementos visuais conforme especificações

---

## 🔄 **0.1.2** - 21 de dezembro de 2025

### 🚀 **Novas Funcionalidades**
- **Versionamento Estruturado**: Sistema de controle de versão implementado
- **Build Scripts**: Automação do processo de desenvolvimento

### 🔧 **Melhorias Técnicas**
- **Estrutura de Release**: Base para versionamento semântico
- **Scripts NPM**: Automação de tarefas de desenvolvimento

---

## 🔄 **0.1.1** - 21 de dezembro de 2025

### 🚀 **Funcionalidades Core Implementadas**

#### **📝 Análise de Texto (TextAnalyzer)**
- ✅ Contagem de palavras, caracteres (com/sem espaços)
- ✅ Detecção de sentenças e parágrafos
- ✅ Análise de sílabas e frequência de palavras
- ✅ Processamento em tempo real

#### **📊 Engine de Estatísticas (StatsEngine)**
- ✅ Cálculos de médias (palavras/sentença, sílabas/palavra)
- ✅ Tempo de leitura estimado (200 WPM)
- ✅ Contagem de vocabulário único
- ✅ Configuração de velocidade de leitura

#### **⏱️ Rastreamento de Sessões (SessionTracker)**
- ✅ Sessões ativas com timestamp
- ✅ Estatísticas diárias com meta configurável
- ✅ Cálculo de palavras por minuto (WPM)
- ✅ Persistência automática de dados

#### **🎨 Interface do Usuário (SidebarView)**
- ✅ Sidebar responsiva (320px) com tema Obsidian
- ✅ Módulos expansíveis (accordion) com animações
- ✅ Painel de configurações com toggles
- ✅ Atualização em tempo real (300ms debounce)
- ✅ Ícones nativos do Obsidian

#### **⚙️ Sistema de Configurações**
- ✅ Toggle individual para cada módulo
- ✅ Persistência automática no vault
- ✅ Interface de checkboxes intuitiva

#### **🔗 Integração com Obsidian**
- ✅ Ribbon icon para toggle da sidebar
- ✅ Status bar indicator ("SW")
- ✅ Comandos registrados
- ✅ Eventos do editor monitorados

### 🔧 **Arquitetura Técnica**
- ✅ TypeScript com tipagem completa
- ✅ Estrutura modular (core, services, ui, i18n)
- ✅ Design patterns adequados
- ✅ Separação de responsabilidades

---

## 🔄 **0.1.0** - 21 de dezembro de 2025

### 🚀 **Estrutura Inicial**
- ✅ Plugin manifest configurado
- ✅ Estrutura de diretórios estabelecida
- ✅ Dependências básicas instaladas
- ✅ TypeScript configurado
- ✅ Build system (Rollup) implementado

### 📁 **Arquitetura de Diretórios**
```
smartwrite-companion/
├── manifest.json              # Plugin manifest
├── package.json               # Dependências e scripts
├── tsconfig.json              # Configuração TypeScript
├── styles.css                 # Estilos CSS
├── docs/                      # Documentação
│   ├── src/                   # Código fonte
│   │   ├── core/              # Lógica de negócio
│   │   ├── services/          # Integrações externas
│   │   ├── ui/                # Interface do usuário
│   │   └── i18n/              # Internacionalização
│   └── ui/                    # Protótipos e designs
└── dist/                      # Build output
```

### 🔧 **Configuração Técnica**
- ✅ Rollup para bundling
- ✅ TypeScript 5.0+
- ✅ Obsidian API integration
- ✅ CSS custom properties para theming

---

## 📈 **Roadmap Futuro**

### **🔮 Próximas Versões**

#### **0.2.0 - Sugestões de Escrita**
- Análise de clichês e redundâncias
- Sugestões de sinônimos
- Detecção de voz passiva
- Recomendações de quebra de parágrafos

#### **0.3.0 - Análise de Readability**
- Implementação de algoritmos de readability (Flesch, Gunning Fog, etc.)
- Adaptação para português brasileiro
- Scores visuais com indicadores
- Comparação de readability por seção

#### **0.4.0 - Integração LLM**
- Análise de persona sintética
- Sugestões contextuais
- Integração com Ollama (localhost)
- Análise de tom e estilo

#### **0.5.0 - Recursos Avançados**
- Gráficos de progresso
- Estatísticas históricas
- Export de relatórios
- Temas customizáveis

---

## 🏆 **Conquistas Técnicas**

### **✅ Performance**
- Contagem instantânea de palavras e caracteres
- Cache inteligente de conteúdo
- Updates seletivos para melhor UX

### **✅ Usabilidade**
- Interface intuitiva e responsiva
- Configurações persistentes
- Feedback visual adequado

### **✅ Arquitetura**
- Código modular e manutenível
- TypeScript com tipagem completa
- Separação clara de responsabilidades

### **✅ Integração**
- Compatibilidade total com Obsidian
- Temas nativos suportados
- API do Obsidian bem integrada

---

## 📞 **Suporte e Contato**

- **Autor**: Zander Catta Preta
- **GitHub**: [zandercpzed/text_companion](https://github.com/zandercpzed/text_companion)
- **Versão Atual**: 0.1.7
- **Compatibilidade**: Obsidian 0.15.0+

---

*Release notes gerados automaticamente em 21 de dezembro de 2025*