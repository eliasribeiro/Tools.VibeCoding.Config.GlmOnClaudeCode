# GLM AI Config Tool

[English](/README.md) | [Português (Brasil)](/README.pt-BR.md) | [Español](/README.es.md)

## 📖 Descrição

GLM AI Configuration Tool é uma aplicação Electron moderna e intuitiva para configurar e gerenciar modelos GLM AI nas plataformas Claude Code e Crush. O aplicativo fornece uma interface gráfica amigável para simplificar o processo de configuração dessas ferramentas de codificação assistida por IA.

## ✨ Características

### 🔑 Gerenciamento de API Key
- Armazenamento seguro da chave API GLM usando o sistema de credenciais do sistema
- Criptografia automática das credenciais
- Interface intuitiva para adicionar, visualizar e remover chaves API

### 🖥️ Configuração do Claude Code
- Configuração automática de variáveis de ambiente (`ANTHROPIC_BASE_URL`, `ANTHROPIC_AUTH_TOKEN`)
- Criação automática do arquivo `.claude/settings.json` com configurações GLM
- Seleção de modelos GLM (GLM-4.5 ou GLM-4.5-Air)
- Seleção de diretório do repositório
- Opção para remover configurações

### ⚡ Configuração do Crush
- Detecção automática da instalação do Crush CLI
- Modificação do arquivo `providers.json` para usar o endpoint de Coding Plan
- Backup automático antes das modificações
- Atualização da URL de `https://api.z.ai/api/paas/v4` para `https://api.z.ai/api/coding/paas/v4`
- Opção para restaurar configurações originais

### 🎨 Interface Moderna
- Design responsivo com suporte a tema claro e escuro
- Navegação intuitiva com sidebar
- Notificações em tempo real
- Status visual das configurações
- Animações suaves e transições

### ⚙️ Configurações Avançadas
- Backup e exportação de configurações
- Limpeza de dados armazenados
- Informações do sistema
- Atualização de status em tempo real

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18, Tailwind CSS, Lucide React Icons
- **Backend**: Electron 22, Node.js
- **Armazenamento**: Electron Store, Keytar (credenciais seguras)
- **Build**: Electron Builder
- **Roteamento**: React Router DOM

## 📋 Pré-requisitos

- Windows 10/11 (x64)
- Node.js 16+ (apenas para desenvolvimento)
- Chave API válida do GLM AI
- Claude Code ou Crush CLI (dependendo da configuração desejada)

## 🚀 Instalação

### Versão Portátil (Recomendada)
1. Baixe `GLM-AI-Config-1.0.0-portable.exe` da seção de releases
2. Execute o arquivo diretamente - não requer instalação
3. Todas as configurações são salvas na pasta do executável

### Versão com Instalador
1. Baixe `GLM-AI-Config Setup 1.0.0.exe` da seção de releases
2. Execute o instalador e siga as instruções
3. O aplicativo será instalado no sistema e criará atalhos

### Versão ZIP
1. Baixe `GLM-AI-Config-1.0.0-win.zip` da seção de releases
2. Extraia para uma pasta de sua escolha
3. Execute `GLM AI Config.exe`

## 🏗️ Desenvolvimento

### Pré-requisitos de Desenvolvimento
```bash
# Node.js 16+
# Git
```

### Configuração do Ambiente
```bash
# Clone o repositório
git clone <repository-url>
cd GLM-AI-Config

# Instale as dependências
npm install

# Execute em modo de desenvolvimento
npm run electron-dev
```

### Scripts Disponíveis
```bash
# Desenvolvimento
npm run dev          # Inicia React dev server
npm run electron-dev # Inicia Electron em modo de desenvolvimento
npm start           # Inicia ambos simultaneamente

# Build
npm run build       # Build do React
npm run build-app   # Build completo da aplicação
npm run dist        # Cria distribuíveis (instalador, zip, portátil)
npm run pack        # Empacota sem criar instalador
```

### Estrutura do Projeto
```
src/
├── components/         # Componentes React reutilizáveis
├── contexts/          # Contextos React (ConfigContext, NotificationContext)
├── main/              # Processo principal do Electron
├── pages/             # Páginas da aplicação
├── utils/             # Utilitários
└── App.js            # Componente principal

build/                 # Build do React
dist/                 # Distribuíveis gerados
assets/               # Recursos (ícones, etc.)
public/               # Arquivos públicos do React
```

## 📖 Como Usar

### 1. Configuração da API Key
1. Abra o aplicativo
2. Navegue para "API Key" na sidebar
3. Insira sua chave API GLM
4. Clique em "Save API Key"

### 2. Configuração do Claude Code
1. Vá para "Claude Code" na sidebar
2. **Step 1**: Clique em "Configure Environment Variables"
3. **Step 2**:
   - Selecione o modelo GLM desejado
   - Escolha o diretório do seu repositório
   - Clique em "Create Settings File"

### 3. Configuração do Crush
1. Certifique-se de que o Crush CLI está instalado
2. Vá para "Crush" na sidebar
3. **Step 1**: Execute "Run Initial Setup" (se necessário)
4. **Step 2**:
   - Selecione o modelo GLM
   - Clique em "Apply GLM Configuration"

### 4. Configurações
- Acesse "Settings" para:
  - Alterar tema (claro/escuro)
  - Exportar backup das configurações
  - Limpar dados armazenados
  - Ver informações do sistema

## 🔧 Configurações Técnicas

### Variáveis de Ambiente (Claude Code)
O aplicativo configura automaticamente:
- `ANTHROPIC_BASE_URL=https://api.z.ai/api/anthropic`
- `ANTHROPIC_AUTH_TOKEN=<sua-api-key>`

### Arquivo de Configuração (Claude Code)
Localização: `<seu-repositório>/.claude/settings.json`
```json
{
  "env": {
    "ANTHROPIC_MODEL": "glm-4.5" // ou "glm-4.5-air"
  }
}
```

### Arquivo Providers (Crush)
Localização: `%USERPROFILE%\AppData\Local\crush\providers.json`
- URL original: `https://api.z.ai/api/paas/v4`
- URL modificada: `https://api.z.ai/api/coding/paas/v4`

## 🛡️ Segurança

- **API Keys**: Armazenadas com criptografia usando o sistema de credenciais do Windows
- **Configurações**: Salvas localmente, nunca transmitidas
- **Backups**: Criados automaticamente antes de modificações
- **Comunicação**: Apenas com serviços Z.AI autorizados

## 🐛 Resolução de Problemas

### Problema: "API Key não encontrada"
**Solução**: Verifique se a chave API foi inserida corretamente na seção "API Key"

### Problema: "Crush CLI não encontrado"
**Solução**: Instale o Crush CLI do site da Z.AI antes de prosseguir

### Problema: "Falha ao definir variáveis de ambiente"
**Solução**: Execute o aplicativo como administrador ou verifique permissões do PowerShell

### Problema: "Arquivo providers.json não encontrado"
**Solução**: Execute o setup inicial do Crush primeiro (Step 1)

### Problema: Tema escuro não funciona
**Solução**: Vá em Settings > Theme e clique no botão "Dark"

## 📝 Changelog

### v1.0.0
- ✅ Configuração completa do Claude Code
- ✅ Configuração completa do Crush
- ✅ Gerenciamento seguro de API Keys
- ✅ Interface moderna com tema claro/escuro
- ✅ Versão portátil disponível
- ✅ Sistema de backup automático
- ✅ Notificações em tempo real

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Contribuição

1. Fork o projeto
2. Crie sua branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Abra uma issue no repositório
- Consulte a documentação da Z.AI
- Entre em contato com a equipe de desenvolvimento

---

**GLM AI Config Tool** - Simplificando a configuração de IA para desenvolvedores 🚀