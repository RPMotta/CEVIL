# 📋 GUIA DE EDIÇÃO DO SITE DA SUA FUNDAÇÃO

## 📁 Estrutura de Arquivos

```
fundacao/
│
├── index.html              ← Página Inicial (HOME)
├── sobre.html              ← Sobre a Fundação
├── contato.html            ← Página de Contato
├── causas.html             ← Nossas Causas / Doe Agora
├── voluntario.html         ← Seja um Voluntário
│
├── [criar você mesmo]
│   ├── noticias.html       ← (use a estrutura das outras páginas)
│   ├── transparencia.html
│   ├── documentos.html
│   ├── parcerias.html
│   ├── diretoria-executiva.html
│   ├── conselho-curador.html
│   ├── conselho-fiscal.html
│   ├── unidade-1.html
│   ├── unidade-2.html
│   └── unidade-3.html
│
├── css/
│   ├── style.css           ← Estilos globais (header, footer, etc.)
│   ├── index.css           ← Estilos exclusivos da Home
│   └── paginas.css         ← Estilos das páginas internas
│
├── js/
│   └── main.js             ← JavaScript (slider, contadores, etc.)
│
└── imagens/                ← Coloque suas fotos aqui
    ├── hero-1.jpg          (foto principal do slider)
    ├── hero-2.jpg
    ├── hero-3.jpg
    ├── banner-sobre.jpg    (banner topo da página Sobre)
    ├── banner-contato.jpg
    ├── banner-causas.jpg
    ├── banner-voluntario.jpg
    ├── noticia-1.jpg
    ├── noticia-2.jpg
    ├── noticia-3.jpg
    ├── causa-1.jpg ... causa-4.jpg
    ├── voluntario.jpg
    └── cta-bg.jpg
```

---

## ✏️ O QUE SUBSTITUIR EM CADA ARQUIVO

### Em TODOS os arquivos HTML, troque:
| Placeholder | Substitua por |
|---|---|
| `Sua Fundação` | Nome real da sua fundação |
| `Transformando Vidas` | Seu slogan |
| `[Seu Endereço Completo]` | Endereço real |
| `[Cidade], [UF]` | Sua cidade e estado |
| `[Seu Telefone]` | Telefone real |
| `[email@fundacao.org.br]` | Seu e-mail real |
| `[00.000.000/0001-00]` | CNPJ real |

### Em causas.html, troque também:
| Placeholder | Substitua por |
|---|---|
| `[CNPJ ou Chave PIX]` | Chave PIX real |
| `[Nome do Banco]` | Banco, agência e conta |

---

## 🎨 CORES DO SITE

Para mudar as cores, edite o arquivo `css/style.css` no início:

```css
:root {
  --azul-escuro: #1a3a5c;    ← Cor principal escura
  --azul-medio: #1e5fa8;     ← Cor principal média
  --dourado: #c8992a;        ← Cor de destaque / botões
  --dourado-claro: #e8b84b;  ← Cor de destaque claro
}
```

---

## 🖼️ IMAGENS

- Coloque todas as suas fotos na pasta `imagens/`
- Use imagens de **pelo menos 1200px de largura** para o slider
- Os banners internos ficam melhores com fotos de **800x400px** ou maior
- Tamanho recomendado: comprimidas em JPG, abaixo de 300KB cada

### Sites gratuitos para baixar fotos:
- **Unsplash**: https://unsplash.com
- **Pexels**: https://pexels.com
- **Freepik**: https://freepik.com

---

## 🗺️ GOOGLE MAPS (Página de Contato)

1. Acesse https://maps.google.com
2. Pesquise seu endereço
3. Clique em **Compartilhar → Incorporar mapa**
4. Copie o código `<iframe ...>`
5. Cole no lugar do comentário em `contato.html`:
   ```html
   <!-- Cole aqui o iframe do Google Maps -->
   ```

---

## 📧 FORMULÁRIO DE CONTATO

O formulário atual é apenas visual (não envia e-mail ainda).
Para ativá-lo, você tem 3 opções:

### Opção 1 – Formspree (grátis, fácil)
1. Crie conta em https://formspree.io
2. Adicione ao `<form>`: `action="https://formspree.io/f/SEUCÓDIGO" method="POST"`

### Opção 2 – EmailJS (grátis até 200 emails/mês)
Veja: https://www.emailjs.com

### Opção 3 – Backend próprio (PHP/Node)
Recomendado se você tiver hospedagem com suporte a servidor.

---

## 🌐 CRIAR UMA NOVA PÁGINA (ex: noticias.html)

1. Copie qualquer arquivo existente (ex: `sobre.html`)
2. Renomeie para `noticias.html`
3. Mude o `<title>` no topo
4. Mude o item `class="ativo"` no menu para o link de Notícias
5. Mude o banner interno (título e breadcrumb)
6. Substitua o conteúdo dentro de `<article class="pagina-corpo">`

---

## 🚀 HOSPEDAGEM (onde publicar o site)

### Opções gratuitas:
- **GitHub Pages**: https://pages.github.com (recomendado para iniciantes)
- **Netlify**: https://netlify.com (arrastar e soltar a pasta!)
- **Vercel**: https://vercel.com

### Opções pagas (domínio .org.br):
- **Registro.br**: registre seu domínio .org.br em https://registro.br
- **Hostgator, Locaweb, KingHost**: hospedagem nacional com suporte em português

---

## 💡 DICAS FINAIS

- ✅ Sempre faça backup antes de editar
- ✅ Use o VS Code (gratuito) para editar os arquivos: https://code.visualstudio.com
- ✅ Instale a extensão "Live Server" no VS Code para ver as mudanças em tempo real
- ✅ Mantenha a estrutura de pastas (css/, js/, imagens/) organizada
- ✅ Teste o site em celular antes de publicar (tamanho responsivo)
