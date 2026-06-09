<?php
//session_start();

//if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
//    header('Location: login.php'); 
//    exit;
//}

include 'conexao.php'; 

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if ($conn->connect_error) {
    die("Falha na conexão com o banco de dados: " . $conn->connect_error);
}

function getItems($conn, $tabela) {
    $items = [];
    $result = $conn->query("SELECT id, nome FROM `$tabela` ORDER BY nome ASC");
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        $result->free();
    }
    return $items;
}

function getMetasSku($conn) {
    $items = [];
    // SQL ALTERADO: Adicionado 'meta_hora'
    $sql = "SELECT id, operacao_nome, meta_diaria, meta_hora 
            FROM metas_sku
            ORDER BY operacao_nome ASC";
    $result = $conn->query($sql);
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
        $result->free();
    }
    return $items;
}

$linhas = getItems($conn, 'linhas');
$operacoes = getItems($conn, 'operacoes'); 
$motivos_parada = getItems($conn, 'motivos_parada');
$produtos_nome = getItems($conn, 'produtos_nome');
$metas_sku = getMetasSku($conn); 
														 

$conn->close(); 
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Admin - Gerenciar Cadastros</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Arial:wght@400;700&display=swap" rel="stylesheet">
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" rel="stylesheet">
<style>
/* ========================================================================= */
/* VARIÁVEIS DE CORES (Seu CSS Dark Theme Moderno) */
/* ========================================================================= */
:root {
    /* Cores de Ação */
    --primary-color: #00d2ff; /* Ciano Principal */
    --secondary-color: #607D8B; /* Cinza Chumbo */
    --success-color: #3f9043; /* Verde Sucesso (Um pouco mais escuro) */
    --danger-color: #E57373; /* Vermelho Perigo Suave */
    --warning-color: #FFB300; /* Amarelo Aviso */
    --info-color: #4DD0E1; /* Ciano Informação */
     
    /* Cores de Fundo e Texto (Dark Theme Suave) */
    --bg-dark: #212121; /* Fundo principal (Preto Suave) */
    --bg-card: #303030; /* Fundo do card (Cinza Escuro) */
    --text-light: #EEEEEE; /* Texto claro */
    --text-dark: #212121; /* Texto para contraste (em elementos claros) */

    --gray-light: #424242; /* Cor de fundo para Hover/Linhas pares/Filtro */
    --gray-medium: #616161; /* Cor de borda/Separador */
    --gray-dark: #121212; /* Cor mais escura (Cabeçalho da tabela) */
     
    /* Variáveis de Sombra e Borda (Ajustadas para MODERNIZAÇÃO) */
    --border-radius-sm: 4px;
    --border-radius-md: 10px; /* AUMENTADO para 10px */
    --border-radius-lg: 12px; /* AUMENTADO para 12px */
    --shadow-md: 0 4px 15px rgba(0, 0, 0, 0.6); /* Sombra mais difusa */
    --shadow-lg: 0 12px 30px rgba(0, 0, 0, 0.9); /* Sombra mais forte para modais/toast */

    /* NOVO ESTILO: Botão de Relatório Diário */
    --report-color: #007bff; /* Azul de relatório */ 
}

/* Reset e base */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Arial', sans-serif;
    -webkit-tap-highlight-color: transparent;
}
html, body {
    min-height: 100vh;
    width: 100%;
    background: var(--bg-dark); 
    color: var(--text-light); 
    display: flex;
    flex-direction: column;
    line-height: 1.6;
    padding: 20px;
    overflow-x: hidden;
}
a {
    text-decoration: none;
    color: inherit;
}

/* Container principal */
.card {
    background: var(--bg-card); 
    border-radius: var(--border-radius-lg); /* ARREDONDAMENTO MAIOR */
    width: 98%;
    max-width: 1400px; /* Ajustado para caber em telas maiores */
    min-height: auto;
    margin: 0 auto;
    padding: 30px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-shadow: var(--shadow-md); 
}

/* Título */
h1 {
    font-size: 2em;
    font-weight: bold;
    text-align: left;
    color: var(--primary-color); 
    margin-bottom: 20px;
    text-shadow: none;
    border-bottom: 2px solid var(--gray-medium);
    padding-bottom: 10px;
}
h2 {
    font-size: 1.5em;
    font-weight: 700;
    color: var(--text-light); 
    margin-bottom: 20px;
    border-bottom: 2px solid var(--gray-medium);
    padding-bottom: 10px;
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
}
h2 i {
    color: var(--primary-color);
}

/* ========================================================================= */
/* ADAPTAÇÕES PARA FORMULÁRIO E LISTA DE CADASTROS (Refinado) */
/* ========================================================================= */

/* Inputs de Formulário (Baseado no .filtro do Kanban) */
.input-group-form {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 25px;
    justify-content: flex-start;
    align-items: center;
    background: var(--gray-light); 
    padding: 15px;
    border-radius: var(--border-radius-md); 
    box-shadow: none;
    border: 1px solid var(--gray-medium);
}
.input-group-form input[type="text"],
.input-group-form input[type="number"],
.input-group-form select {
    flex: 1;
    min-width: 200px; /* Ajustado para melhor responsividade */
    padding: 10px; 
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--gray-medium);
    font-size: 1em;
    outline: none;
    background: var(--bg-card); 
    color: var(--text-light); 
    transition: all 0.2s ease-in-out;
}
.input-group-form input[type="text"]:focus,
.input-group-form input[type="number"]:focus,
.input-group-form select:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px #00d2ff;
    background: var(--gray-light);
}
.input-group-form input::placeholder {
    color: var(--gray-medium);
    opacity: 1;
}
.input-group-form button {
    padding: 10px 18px;
    border-radius: var(--border-radius-md); 
    border: none;
    font-weight: bold;
    font-size: 1em;
    cursor: pointer;
    transition: background-color 0.3s;
    box-shadow: none;
    color: var(--text-dark); 
    display: flex;
    align-items: center;
    gap: 5px;
    background: var(--success-color); /* Botão de Adicionar sempre verde */
    flex: 0 1 auto; /* Permite que o botão não se estique demais */
}
.input-group-form button:hover {
    background: #388E3C;
    color: var(--text-light);
    transform: none;
}
.input-group-form button:active {
    transform: none;
    box-shadow: none;
}

/* Campo de pesquisa fora da área do formulário */
.search-input {
    min-width: 100%;
    margin-bottom: 20px;
    padding: 10px; 
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--gray-medium);
    font-size: 1em;
    outline: none;
    background: var(--gray-dark); /* Fundo mais escuro */
    color: var(--text-light); 
    transition: all 0.2s ease-in-out;
}
.search-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px #00d2ff;
    background: var(--gray-light);
}
.search-input::placeholder {
    color: var(--gray-medium);
    opacity: 1;
}


/* Lista de itens */
.list-container {
    background: var(--bg-card); /* Cor de fundo do card para o container da lista */
    border-radius: var(--border-radius-md);
    overflow: hidden;
    box-shadow: var(--shadow-md);
}
ul {
    list-style: none;
    padding: 0;
    max-height: 400px;
    overflow-y: auto;
}
ul li {
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--gray-medium);
    transition: background 0.2s ease-in-out;
    flex-wrap: wrap;
    font-size: 1em;
}
ul li:last-child { border-bottom: none; }
ul li:hover { background: var(--gray-light); }
li span { flex: 1; color: var(--text-light); }

/* Ações para itens da lista (Editar/Excluir) */
li .item-actions {
    display: flex;
    gap: 8px;
    margin-left: 15px;
    flex-wrap: wrap;
}
li button {
    padding: 8px 12px;
    border: none;
    border-radius: var(--border-radius-sm);
    cursor: pointer;
    font-weight: bold;
    font-size: 0.8em;
    transition: all 0.2s ease-in-out;
    box-shadow: none;
    color: var(--text-dark); 
}

li .btnEdit { background: var(--info-color); color: var(--text-dark); }
li .btnEdit:hover { background: #26C6DA; }
li .btnDelete { background: var(--danger-color); color: var(--text-light); }
li .btnDelete:hover { background: #D32F2F; }
li button:hover { transform: none; filter: brightness(1.1); }
li button:active { transform: none; box-shadow: none; }

/* Destaque da pesquisa */
.highlight {
    background: var(--warning-color);
    color: var(--text-dark);
    border-radius: 4px;
    padding: 2px 4px;
    font-weight: bold;
}
													  
/* Link de voltar (CORRIGIDO: IDÊNTICO AO .admin-links-group) */
.back-link {
    /* Container do link - Imita o .admin-links-group */
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: flex-start;
    margin-bottom: 20px;
    padding: 10px;
    background-color: var(--gray-light); /* Cor do container do menu KanBan */
    border-radius: var(--border-radius-md); /* ARREDONDAMENTO MAIOR */
}
.back-link a {
    /* O 'a' imita o .admin-link a */
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: var(--primary-color); /* Azul Ciano Principal */
    padding: 10px 15px;
    border-radius: var(--border-radius-md); /* ARREDONDAMENTO MAIOR */
    color: var(--text-dark); /* Letra escura no botão claro */
    font-weight: bold;
    transition: background-color 0.3s;
    box-shadow: none;
    font-size: 1em; 
}
.back-link a:hover{
    background: #00d2ff;
    transform: none;
    color: var(--text-light); /* Letra ilumina (fica clara) */
}


/* ========================================================================= */
/* MODALS e TOAST (Baseado no Kanban Original) */
/* ========================================================================= */

/* Toast */
.toast {
    position: fixed; 
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10000;
    padding: 12px 20px;
    min-width: 250px;
    text-align: center;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.3s, bottom 0.3s;
    background: var(--bg-card);
    color: var(--text-light);
    border-radius: var(--border-radius-md); 
    box-shadow: var(--shadow-lg);
}
.toast.show {
    visibility: visible;
    opacity: 1;
    bottom: 30px;
}
.toast.error { background: var(--danger-color) !important; }
.toast.success { background: var(--success-color) !important; }

/* Modals */
.modal {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
}
.modal.show { opacity: 1; display: flex; }
.modal-content {
    background: var(--bg-card);
    padding: 30px;
    border-radius: var(--border-radius-lg); 
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: var(--shadow-lg);
    transform: translateY(-50px);
    transition: transform 0.3s ease-in-out;
    border: 1px solid var(--gray-medium);
}
.modal.show .modal-content {
    transform: translateY(0);
}
.modal-content h2 {
    font-size: 1.5em;
    color: var(--primary-color);
    border-bottom: 2px solid var(--gray-medium);
    padding-bottom: 10px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.modal-content h2 i {
    color: var(--primary-color);
}

.close {
    position: absolute;
    top: 15px;
    right: 20px;
    font-size: 2em;
    cursor: pointer;
    color: var(--gray-medium);
    transition: color 0.3s;
    font-weight: normal;
}
.close:hover {
    color: var(--danger-color);
}

.input-group { /* Dentro do modal */
    display: flex;
    flex-direction: column;
    margin-bottom: 15px;
}
.input-group label {
    font-size: 0.9em;
    color: var(--text-light);
    margin-bottom: 5px;
}
.input-group input {
    padding: 10px;
    border-radius: var(--border-radius-md); 
    border: 1px solid var(--gray-medium);
    background: var(--bg-dark);
    color: var(--text-light);
    font-size: 1em;
    outline: none;
}
.input-group input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px #00d2ff;
    background: var(--gray-light);
}

/* Botões do Modal (Usando a classe .btn para consistência) */
.btn-salvar-modal, .btn-confirmar-exclusao, .btn-cancelar-exclusao {
    padding: 10px 18px; 
    border-radius: var(--border-radius-md); 
    border: none;
    font-weight: bold;
    font-size: 1em;
    cursor: pointer;
    transition: background-color 0.3s;
    box-shadow: none;
    color: var(--text-dark); 
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    margin-top: 15px;
}

.btn-salvar-modal {
    background: var(--success-color);
    color: var(--text-dark);
    margin-top: 20px;
}
.btn-salvar-modal:hover {
    background: #388E3C;
    color: var(--text-light);
}

.modal-footer {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 20px;
}

.btn-confirmar-exclusao {
    background: var(--danger-color);
    color: var(--text-light);
}
.btn-confirmar-exclusao:hover {
    background: #D32F2F;
}

.btn-cancelar-exclusao {
    background: var(--secondary-color);
    color: var(--text-light);
}
.btn-cancelar-exclusao:hover {
    background: #455A64;
}

.modal-footer button {
    flex-grow: 1;
    margin-top: 0;
}

/* --- BARRA DE ROLAGEM --- */
html::-webkit-scrollbar,
ul::-webkit-scrollbar,
.modal-content::-webkit-scrollbar { 
    width: 10px;
    height: 10px;
}

html::-webkit-scrollbar-track,
ul::-webkit-scrollbar-track,
.modal-content::-webkit-scrollbar-track { 
    background: var(--bg-dark);
}

html::-webkit-scrollbar-thumb,
ul::-webkit-scrollbar-thumb,
.modal-content::-webkit-scrollbar-thumb { 
    background: var(--text-light); /* Polegar branco claro */
    border-radius: 5px;
    border: 2px solid var(--bg-dark); /* Descola */
}

html::-webkit-scrollbar-thumb:hover,
ul::-webkit-scrollbar-thumb:hover,
.modal-content::-webkit-scrollbar-thumb:hover { 
    background: var(--primary-color); 
    border: 2px solid var(--bg-dark);
}


/* ========================================================================= */
/* RESPONSIVO (Baseado no Kanban Original) */
/* ========================================================================= */
@media(max-width:992px){
    .card{ max-width: 95%; padding: 20px; }
    h1{ font-size: 2em; margin-bottom: 20px;}
    h2{ font-size: 1.4em; margin-bottom: 15px;}
    .input-group-form { flex-direction: column; align-items: stretch; gap: 10px; padding: 10px; }
    .input-group-form input, 
    .input-group-form select,
    .input-group-form button { width: 100%; font-size: 1em; padding: 10px; }
    .search-input { width: 100%; font-size: 1em; padding: 10px; }
    
    ul li { flex-direction: column; align-items: flex-start; padding: 10px 15px; font-size: 0.9em; }
    li span { width: 100%; margin-bottom: 5px; }
    li .item-actions { margin-left: 0; margin-top: 5px; justify-content: space-between; width: 100%; gap: 5px; }
    li button { flex: 1; padding: 8px 10px; font-size: 0.75em; }

    .back-link { margin-bottom: 15px; }
    .back-link a{ font-size: 0.9em; padding: 10px 15px; }

    .modal-content { padding: 25px 20px; max-width: 95%; border-radius: var(--border-radius-md); }
    .modal-content h2 { font-size: 1.6em; }
    .close { font-size: 1.8em; top: 10px; right: 15px; }
    .btn-salvar-modal, .modal-footer button { padding: 10px 15px; font-size: 0.9em; }
    .modal-footer { flex-direction: column; }
}

@media(max-width:768px){
    .card{ padding: 15px; gap: 15px; }
    h1{ font-size: 1.8em; }
    h2{ font-size: 1.2em; }
}

</style>
</head>
<body>
<div class="card">
    <h1><i class="fas fa-cogs"></i> Gerenciar Cadastros Atlanta</h1>

    <div class="back-link">
        <a href="admin_painel.php"><i class="fas fa-arrow-left"></i> Voltar Gerenciamento de Produção Atlanta</a>
    </div>

    <section>
        <h2><i class="fas fa-stream"></i> Linhas de Produção</h2>
        <form class="input-group-form" onsubmit="event.preventDefault(); adicionarItem('linhas', 'inputLinha')">
            <input type="text" id="inputLinha" placeholder="Adicionar Nova Linha" required />
            <button type="submit"><i class="fas fa-plus-circle"></i> Adicionar</button>
        </form>
        <input type="text" id="searchLinha" class="search-input" placeholder="🔍 Pesquisar Linha..." onkeyup="filtrarItens('linhas', this.value)">
        <div class="list-container">
            <ul id="listaLinhas">
                <?php foreach ($linhas as $l) { ?>
                <li data-id="<?= htmlspecialchars($l['id']) ?>" data-tabela="linhas">
                    <span><?= htmlspecialchars($l['nome']) ?></span>
                    <div class="item-actions">
                        <button class="btnEdit" onclick="abrirEditarCadastro(<?= htmlspecialchars($l['id']) ?>, 'linhas', '<?= htmlspecialchars(addslashes($l['nome'])) ?>')"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btnDelete" onclick="abrirConfirmarExclusao(<?= htmlspecialchars($l['id']) ?>, 'linhas', '<?= htmlspecialchars(addslashes($l['nome'])) ?>')"><i class="fas fa-trash-alt"></i> Excluir</button>
                    </div>
                </li>
                <?php } ?>
            </ul>
        </div>
    </section>


    <section>
        <h2><i class="fas fa-cogs"></i> SKU</h2>
        <form class="input-group-form" onsubmit="event.preventDefault(); adicionarItem('operacoes', 'inputOperacao')">
            <input type="text" id="inputOperacao" placeholder="Adicionar Nova SKU" required />
            <button type="submit"><i class="fas fa-plus-circle"></i> Adicionar</button>
        </form>
        <input type="text" id="searchOperacao" class="search-input" placeholder="🔍 Pesquisar SKU..." onkeyup="filtrarItens('operacoes', this.value)">
        <div class="list-container">
            <ul id="listaOperacoes">
                <?php foreach ($operacoes as $o) { ?>
                <li data-id="<?= htmlspecialchars($o['id']) ?>" data-tabela="operacoes">
                    <span><?= htmlspecialchars($o['nome']) ?></span>
                    <div class="item-actions">
                        <button class="btnEdit" onclick="abrirEditarCadastro(<?= htmlspecialchars($o['id']) ?>, 'operacoes', '<?= htmlspecialchars(addslashes($o['nome'])) ?>')"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btnDelete" onclick="abrirConfirmarExclusao(<?= htmlspecialchars($o['id']) ?>, 'operacoes', '<?= htmlspecialchars(addslashes($o['nome'])) ?>')"><i class="fas fa-trash-alt"></i> Excluir</button>
                    </div>
                </li>
                <?php } ?>
            </ul>
        </div>
    </section>

    <section>
        <h2><i class="fas fa-ban"></i> Motivos de Parada</h2>
        <form class="input-group-form" onsubmit="event.preventDefault(); adicionarItem('motivos_parada', 'inputMotivoParada')">
            <input type="text" id="inputMotivoParada" placeholder="Adicionar Novo Motivo de Parada" required />
            <button type="submit"><i class="fas fa-plus-circle"></i> Adicionar</button>
        </form>
        <input type="text" id="searchMotivoParada" class="search-input" placeholder="🔍 Pesquisar Motivo de Parada..." onkeyup="filtrarItens('motivos_parada', this.value)">
        <div class="list-container">
            <ul id="listaMotivosParada">
                <?php foreach ($motivos_parada as $mp) { ?>
                <li data-id="<?= htmlspecialchars($mp['id']) ?>" data-tabela="motivos_parada">
                    <span><?= htmlspecialchars($mp['nome']) ?></span>
                    <div class="item-actions">
                        <button class="btnEdit" onclick="abrirEditarCadastro(<?= htmlspecialchars($mp['id']) ?>, 'motivos_parada', '<?= htmlspecialchars(addslashes($mp['nome'])) ?>')"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btnDelete" onclick="abrirConfirmarExclusao(<?= htmlspecialchars($mp['id']) ?>, 'motivos_parada', '<?= htmlspecialchars(addslashes($mp['nome'])) ?>')"><i class="fas fa-trash-alt"></i> Excluir</button>
                    </div>
                </li>
                <?php } ?>
            </ul>
        </div>
    </section>

    <section>
        <h2><i class="fas fa-box-open"></i> Produtos</h2>
        <form class="input-group-form" onsubmit="event.preventDefault(); adicionarItem('produtos_nome', 'inputProdutoNome')">
            <input type="text" id="inputProdutoNome" placeholder="Adicionar Novo Produto" required />
            <button type="submit"><i class="fas fa-plus-circle"></i> Adicionar</button>
        </form>
        <input type="text" id="searchProdutoNome" class="search-input" placeholder="🔍 Pesquisar Produto..." onkeyup="filtrarItens('produtos_nome', this.value)">
        <div class="list-container">
            <ul id="listaProdutosNome">
                <?php foreach ($produtos_nome as $pn) { ?>
                <li data-id="<?= htmlspecialchars($pn['id']) ?>" data-tabela="produtos_nome">
                    <span><?= htmlspecialchars($pn['nome']) ?></span>
                    <div class="item-actions">
                        <button class="btnEdit" onclick="abrirEditarCadastro(<?= htmlspecialchars($pn['id']) ?>, 'produtos_nome', '<?= htmlspecialchars(addslashes($pn['nome'])) ?>')"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btnDelete" onclick="abrirConfirmarExclusao(<?= htmlspecialchars($pn['id']) ?>, 'produtos_nome', '<?= htmlspecialchars(addslashes($pn['nome'])) ?>')"><i class="fas fa-trash-alt"></i> Excluir</button>
                    </div>
                </li>
                <?php } ?>
            </ul>
        </div>
    </section>
    
    <!-- --- Seção de Metas por SKU ATUALIZADA --- -->
    <section>
        <h2><i class="fas fa-bullseye"></i> Metas Diárias e Por Hora por SKU</h2>
        <form class="input-group-form" onsubmit="event.preventDefault(); adicionarMetaSku()">
            <select id="selectOperacaoMeta" required>
                <option value="">Selecione o SKU</option>
                <?php 
                $skus_com_meta_existente = array_column($metas_sku, 'operacao_nome');
                foreach ($operacoes as $o) { 
                    // Se o SKU já tiver meta, não o mostra no select de adição
                    if (!in_array($o['nome'], $skus_com_meta_existente)) {
                ?>
                    <option value="<?= htmlspecialchars($o['nome']) ?>"><?= htmlspecialchars($o['nome']) ?></option>
                <?php 
                    }
                } 
                ?>
            </select>
            <input type="number" id="inputMetaDiaria" placeholder="Meta Diária (ex: 50)" min="1" required />
            <input type="number" id="inputMetaHora" placeholder="Meta p/ Hora (ex: 7)" min="1" required />
            <button type="submit"><i class="fas fa-plus-circle"></i> Adicionar Meta</button>
        </form>
        
        <input type="text" id="searchMetaSku" class="search-input" placeholder="🔍 Pesquisar Meta por SKU..." onkeyup="filtrarItens('metas_sku', this.value)">
        <div class="list-container">
            <ul id="listaMetasSku">
                <?php 
                if (!empty($metas_sku)) {
                    foreach ($metas_sku as $ms) { 
                ?>
                <li data-id="<?= htmlspecialchars($ms['id']) ?>" data-tabela="metas_sku" data-nome-item="<?= htmlspecialchars($ms['operacao_nome']) ?>">
                    <span>
                        **SKU:** <?= htmlspecialchars($ms['operacao_nome']) ?> | 
                        **Meta Diária:** <strong style="color: var(--primary-color);"><?= htmlspecialchars($ms['meta_diaria']) ?></strong> |
                        **Meta Hora:** <strong style="color: var(--warning-color);"><?= htmlspecialchars($ms['meta_hora'] ?? 0) ?></strong>
                    </span>
                    <div class="item-actions">
                        <button class="btnEdit" onclick="abrirEditarMetaSku(<?= htmlspecialchars($ms['id']) ?>, '<?= htmlspecialchars(addslashes($ms['operacao_nome'])) ?>', <?= htmlspecialchars($ms['meta_diaria']) ?>, <?= htmlspecialchars($ms['meta_hora'] ?? 0) ?>)"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btnDelete" onclick="abrirConfirmarExclusao(<?= htmlspecialchars($ms['id']) ?>, 'metas_sku', 'Meta para SKU: <?= htmlspecialchars(addslashes($ms['operacao_nome'])) ?>')"><i class="fas fa-trash-alt"></i> Excluir</button>
                    </div>
                </li>
                <?php 
                    }
                } else {
                    echo "<li style='justify-content: center;'>Nenhuma meta por SKU cadastrada.</li>";
                }
                ?>
            </ul>
        </div>
    </section>
</div>

<div id="toast" class="toast"></div>


<div class="modal" id="modalEditarCadastro">
  <div class="modal-content">
    <span class="close" id="fecharModalCadastro">&times;</span>
    <h2><i class="fas fa-edit"></i> Editar Item</h2>
    <input type="hidden" id="editCadastroId">
    <input type="hidden" id="editCadastroTabela">
    
    <div class="input-group">
      <label for="editCadastroNome">Nome do Item</label>
      <input type="text" id="editCadastroNome" required>
    </div>
    <button class="btn-salvar-modal" onclick="salvarEdicaoCadastro()"><i class="fas fa-save"></i> Salvar Alterações</button>
  </div>
</div>

<!-- --- Modal de Edição de Meta por SKU ATUALIZADO --- -->
<div class="modal" id="modalEditarMetaSku">
  <div class="modal-content">
    <span class="close" id="fecharModalMetaSku">&times;</span>
    <h2><i class="fas fa-edit"></i> Editar Meta por SKU</h2>
    <input type="hidden" id="editMetaSkuId">
    <input type="hidden" id="editMetaSkuNomeAntigo">
    
    <div class="input-group">
      <label for="editMetaSkuNome">SKU (Operação)</label>
      <input type="text" id="editMetaSkuNome" disabled>
    </div>
    
    <div class="input-group">
      <label for="editMetaSkuValorDiaria">Meta Diária</label>
      <input type="number" id="editMetaSkuValorDiaria" min="1" required>
    </div>
    
    <div class="input-group">
      <label for="editMetaSkuValorHora">Meta por Hora</label>
      <input type="number" id="editMetaSkuValorHora" min="1" required>
    </div>
    <button class="btn-salvar-modal" onclick="salvarEdicaoMetaSku()"><i class="fas fa-save"></i> Salvar Alterações</button>
  </div>
</div>

<div class="modal" id="modalConfirmarExclusao">
    <div class="modal-content">
        <span class="close" id="fecharModalConfirmacao">&times;</span>
        <h2><i class="fas fa-trash-alt"></i> Confirmar Exclusão</h2>
        <p>Tem certeza que deseja excluir o item "<strong id="itemExcluirNome"></strong>" da tabela <strong id="itemExcluirTabela"></strong>?</p>
        <p>Esta ação é irreversível.</p>
        <input type="hidden" id="excluirId">
        <input type="hidden" id="excluirTabela">
        <div class="modal-footer">
            <button class="btn-cancelar-exclusao" onclick="toggleModal('modalConfirmarExclusao', false)"><i class="fas fa-times"></i> Cancelar</button>
            <button class="btn-confirmar-exclusao" onclick="executarExclusao()"><i class="fas fa-check"></i> Confirmar Exclusão</button>
        </div>
    </div>
</div>


<script>
const toastEl = document.getElementById('toast');
function showToast(msg, type='success'){ 
    toastEl.textContent = msg;
    toastEl.className = `toast show ${type}`;
    setTimeout(()=>{ toastEl.className='toast'; },3000);
}


function toPascalCase(str) {
    return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
}

const modalCadastro = document.getElementById('modalEditarCadastro');
const fecharModalCadastro = document.getElementById('fecharModalCadastro');
const modalConfirmacao = document.getElementById('modalConfirmarExclusao');
const fecharModalConfirmacao = document.getElementById('fecharModalConfirmacao');
const modalMetaSku = document.getElementById('modalEditarMetaSku');
const fecharModalMetaSku = document.getElementById('fecharModalMetaSku');
fecharModalMetaSku.onclick = () => toggleModal('modalEditarMetaSku', false);

function toggleModal(id, show) {
    const modal = document.getElementById(id);
    if (show) {
        modal.style.display = "flex";
        setTimeout(() => modal.classList.add('show'), 10);
    } else {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = "none", 300);
    }
}

fecharModalCadastro.onclick = () => toggleModal('modalEditarCadastro', false);
fecharModalConfirmacao.onclick = () => toggleModal('modalConfirmarExclusao', false); 
window.onclick = e => { 
    if(e.target === modalCadastro) toggleModal('modalEditarCadastro', false); 
    if(e.target === modalConfirmacao) toggleModal('modalConfirmarExclusao', false); 
    if(e.target === modalMetaSku) toggleModal('modalEditarMetaSku', false);
}

function adicionarItem(tabela, inputId) {
    const inputEl = document.getElementById(inputId);
    const nome = inputEl.value.trim();
    if (!nome) {
        showToast('Nome não pode ser vazio!', 'error');
        return;
    }

    inputEl.disabled = true;
    inputEl.closest('form').querySelector('button').disabled = true;

    const data = new URLSearchParams();
    data.append('acao', 'adicionar');
    data.append('tabela', tabela);
    data.append('nome', nome);

    fetch('salvar_adm.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
    })
    .then(r => r.text())
    .then(msg => {
        if (msg.startsWith('✅ OK')) {
            const newId = msg.split(':')[1];
            showToast('✅ Adicionado com sucesso!');
            inputEl.value = '';

            const listaEl = document.getElementById('lista' + toPascalCase(tabela));
            if (!listaEl) {
                console.error(`Elemento com ID 'lista${toPascalCase(tabela)}' não encontrado.`);
                showToast('Erro interno: Não foi possível atualizar a lista.', 'error');
                return;
            }
            
            if (tabela === 'metas_sku' && listaEl.querySelector('li').textContent.includes('Nenhuma meta')) {
                 listaEl.innerHTML = '';
            }

            const newLi = document.createElement('li');
            newLi.setAttribute('data-id', newId);
            newLi.setAttribute('data-tabela', tabela);
            
            let liContent = `<span>${htmlspecialchars(nome)}</span>`;
            
            newLi.innerHTML = `
                ${liContent}
                <div class="item-actions">
                    <button class="btnEdit" onclick="abrirEditarCadastro(${newId}, '${tabela}', '${htmlspecialchars(addslashes(nome))}')"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btnDelete" onclick="abrirConfirmarExclusao(${newId}, '${tabela}', '${htmlspecialchars(addslashes(nome))}')"><i class="fas fa-trash-alt"></i> Excluir</button>
                </div>
            `;
            listaEl.appendChild(newLi);
            
            if (tabela === 'operacoes') {
                const selectMeta = document.getElementById('selectOperacaoMeta');
                const newOption = document.createElement('option');
                newOption.value = nome;
                newOption.textContent = nome;
                selectMeta.appendChild(newOption);
            }


        } else {
            showToast(msg, 'error');
        }
    })
    .catch(err => showToast('Erro de conexão: ' + err, 'error'))
    .finally(() => {
        inputEl.disabled = false;
        inputEl.closest('form').querySelector('button').disabled = false;
    });
}

function abrirEditarCadastro(id, tabela, nomeAtual) {
    document.getElementById('editCadastroId').value = id;
    document.getElementById('editCadastroTabela').value = tabela;
    document.getElementById('editCadastroNome').value = nomeAtual;
    
    const modalTitle = document.querySelector('#modalEditarCadastro .modal-content h2');
    modalTitle.innerHTML = `<i class="fas fa-edit"></i> Editar ${tabela.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`;

    toggleModal('modalEditarCadastro', true);
}


function salvarEdicaoCadastro() {
    const id = document.getElementById('editCadastroId').value;
    const tabela = document.getElementById('editCadastroTabela').value;
    const novoNome = document.getElementById('editCadastroNome').value.trim();
    const listItem = document.querySelector(`#lista${toPascalCase(tabela)} li[data-id="${id}"]`);
    const nomeAntigo = listItem ? listItem.querySelector('span').textContent.trim() : '';

    if (!novoNome) {
        showToast('Nome não pode ser vazio!', 'error');
        return;
    }

    if (novoNome === nomeAntigo) {
        showToast('Nenhuma alteração detectada.', 'info');
        toggleModal('modalEditarCadastro', false);
        return;
    }

    const data = new URLSearchParams();
    data.append('acao', 'editar');
    data.append('tabela', tabela);
    data.append('id', id);
    data.append('nome', novoNome);

    fetch('salvar_adm.php', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
    })
    .then(r => r.text())
    .then(msg => {
        if (msg.startsWith('✅ OK')) {
            showToast('✅ Salvo com sucesso!');
            if (listItem) {
                const span = listItem.querySelector('span');
                span.textContent = htmlspecialchars(novoNome);
                const btnEdit = listItem.querySelector('.btnEdit');
                btnEdit.setAttribute('onclick', `abrirEditarCadastro(${id}, '${tabela}', '${htmlspecialchars(addslashes(novoNome))}')`);
                const btnDelete = listItem.querySelector('.btnDelete');
                btnDelete.setAttribute('onclick', `abrirConfirmarExclusao(${id}, '${tabela}', '${htmlspecialchars(addslashes(novoNome))}')`);
            }
        } else {
            showToast(msg, 'error');
        }
        toggleModal('modalEditarCadastro', false);
    })
    .catch(e => {
        showToast('Erro de conexão ao salvar: ' + e, 'error');
        toggleModal('modalEditarCadastro', false);
    });
}

function abrirConfirmarExclusao(id, tabela, nomeItem) {
    document.getElementById('excluirId').value = id;
    document.getElementById('excluirTabela').value = tabela;
    document.getElementById('itemExcluirNome').textContent = nomeItem;
    document.getElementById('itemExcluirTabela').textContent = tabela.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    
    toggleModal('modalConfirmarExclusao', true);
}

function executarExclusao() {
    const id = document.getElementById('excluirId').value;
    const tabela = document.getElementById('excluirTabela').value;

    toggleModal('modalConfirmarExclusao', false); // Fecha 

    const listItem = document.querySelector(`#lista${toPascalCase(tabela)} li[data-id="${id}"]`);
    if (listItem) {
        listItem.querySelectorAll('button').forEach(btn => btn.disabled = true); 
    }
    
    let nomeItemExcluido = '';
    if (tabela === 'metas_sku') {

        nomeItemExcluido = listItem ? listItem.getAttribute('data-nome-item') : '';
    }

    const data = new URLSearchParams();
    data.append('acao', 'excluir');
    data.append('tabela', tabela);
    data.append('id', id);

    fetch('salvar_adm.php', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
    })
    .then(r => r.text())
    .then(msg => {
        if (msg.startsWith('✅ OK')) {
            if (listItem) listItem.remove();
            showToast('✅ Excluído com sucesso!');
            
            if (tabela === 'metas_sku' && nomeItemExcluido) {
                const selectMeta = document.getElementById('selectOperacaoMeta');
                const newOption = document.createElement('option');
                newOption.value = nomeItemExcluido;
                newOption.textContent = nomeItemExcluido;
                selectMeta.appendChild(newOption); 
            }
             if (tabela === 'metas_sku' && document.getElementById('listaMetasSku').children.length === 0) {
                 document.getElementById('listaMetasSku').innerHTML = '<li style="justify-content: center;">Nenhuma meta por SKU cadastrada.</li>';
             }

        } else {
            showToast(msg, 'error');
            if (listItem) listItem.querySelectorAll('button').forEach(btn => btn.disabled = false);
        }
    }).catch(err => {
        showToast('Erro de conexão ao excluir: ' + err, 'error');
        if (listItem) listItem.querySelectorAll('button').forEach(btn => btn.disabled = false); 
    });
}

function adicionarMetaSku() {
    const selectEl = document.getElementById('selectOperacaoMeta');
    const inputMetaDiariaEl = document.getElementById('inputMetaDiaria');
    const inputMetaHoraEl = document.getElementById('inputMetaHora');
    const operacao_nome = selectEl.value;
    const meta_diaria = parseInt(inputMetaDiariaEl.value);
    const meta_hora = parseInt(inputMetaHoraEl.value);

    if (!operacao_nome) {
        showToast('Selecione um SKU!', 'error');
        return;
    }
    if (isNaN(meta_diaria) || meta_diaria <= 0) {
        showToast('Meta diária deve ser um número positivo!', 'error');
        return;
    }
    if (isNaN(meta_hora) || meta_hora <= 0) { 
        showToast('Meta por hora deve ser um número positivo!', 'error');
        return;
    }


    selectEl.disabled = true;
    inputMetaDiariaEl.disabled = true;
    inputMetaHoraEl.disabled = true;
    inputMetaDiariaEl.closest('form').querySelector('button').disabled = true;

    const data = new URLSearchParams();
    data.append('acao', 'adicionar');
    data.append('tabela', 'metas_sku');
    data.append('operacao_nome', operacao_nome);
    data.append('meta_diaria', meta_diaria);
    data.append('meta_hora', meta_hora);

    fetch('salvar_adm.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
    })
    .then(r => r.text())
    .then(msg => {
        if (msg.startsWith('✅ OK')) {
            const newId = msg.split(':')[1];
            showToast('✅ Meta SKU adicionada com sucesso!');
            inputMetaDiariaEl.value = '';
            inputMetaHoraEl.value = '';
           
            const optionToRemove = selectEl.querySelector(`option[value="${operacao_nome}"]`);
            if(optionToRemove) optionToRemove.remove();
            selectEl.value = ''; 

            const listaEl = document.getElementById('listaMetasSku');
            
            if (listaEl.querySelector('li') && listaEl.querySelector('li').textContent.includes('Nenhuma meta')) {
                 listaEl.innerHTML = '';
            }
            
            const newLi = document.createElement('li');
            newLi.setAttribute('data-id', newId);
            newLi.setAttribute('data-tabela', 'metas_sku');
            newLi.setAttribute('data-nome-item', operacao_nome); 

            newLi.innerHTML = `
                <span>
                    **SKU:** ${htmlspecialchars(operacao_nome)} | 
                    **Meta Diária:** <strong style="color: var(--primary-color);">${meta_diaria}</strong> |
                    **Meta Hora:** <strong style="color: var(--warning-color);">${meta_hora}</strong>
                </span>
                <div class="item-actions">
                    <button class="btnEdit" onclick="abrirEditarMetaSku(${newId}, '${htmlspecialchars(addslashes(operacao_nome))}', ${meta_diaria}, ${meta_hora})"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btnDelete" onclick="abrirConfirmarExclusao(${newId}, 'metas_sku', 'Meta para SKU: ${htmlspecialchars(addslashes(operacao_nome))}')"><i class="fas fa-trash-alt"></i> Excluir</button>
                </div>
            `;
            listaEl.appendChild(newLi);

        } else if (msg.includes('UNIQUE constraint failed') || msg.includes('Duplicate entry')) {
            showToast('Erro: Já existe uma meta cadastrada para este SKU!', 'error');
        } else {
            showToast(msg, 'error');
        }
    })
    .catch(err => showToast('Erro de conexão: ' + err, 'error'))
    .finally(() => {
        selectEl.disabled = false;
        inputMetaDiariaEl.disabled = false;
        inputMetaHoraEl.disabled = false;
        inputMetaDiariaEl.closest('form').querySelector('button').disabled = false;
    });
}

function abrirEditarMetaSku(id, skuNome, metaAtualDiaria, metaAtualHora) {
    document.getElementById('editMetaSkuId').value = id;
    document.getElementById('editMetaSkuNomeAntigo').value = skuNome;
    document.getElementById('editMetaSkuNome').value = skuNome; 
    document.getElementById('editMetaSkuValorDiaria').value = metaAtualDiaria; 
    document.getElementById('editMetaSkuValorHora').value = metaAtualHora;
    
    toggleModal('modalEditarMetaSku', true);
}


function salvarEdicaoMetaSku() {
    const id = document.getElementById('editMetaSkuId').value;
    const skuNome = document.getElementById('editMetaSkuNome').value;
    const metaValorDiaria = parseInt(document.getElementById('editMetaSkuValorDiaria').value);
    const metaValorHora = parseInt(document.getElementById('editMetaSkuValorHora').value);

    if (isNaN(metaValorDiaria) || metaValorDiaria <= 0) {
        showToast('Meta diária deve ser um número positivo!', 'error');
        return;
    }
    if (isNaN(metaValorHora) || metaValorHora <= 0) {
        showToast('Meta por hora deve ser um número positivo!', 'error');
        return;
    }
    
    const listItem = document.querySelector(`#listaMetasSku li[data-id="${id}"]`);
    // Usando nth-child para pegar os valores exibidos. Ajuste se o HTML mudar.
    const strongs = listItem ? listItem.querySelectorAll('span strong') : null;
    const metaAntigaDiaria = strongs && strongs.length > 0 ? parseInt(strongs[0].textContent) : 0; 
    const metaAntigaHora = strongs && strongs.length > 1 ? parseInt(strongs[1].textContent) : 0;


    if (metaValorDiaria === metaAntigaDiaria && metaValorHora === metaAntigaHora) {
        showToast('Nenhuma alteração de meta detectada.', 'info');
        toggleModal('modalEditarMetaSku', false);
        return;
    }


    const data = new URLSearchParams();
    data.append('acao', 'editar');
    data.append('tabela', 'metas_sku');
    data.append('id', id);
    data.append('meta_diaria', metaValorDiaria); 
    data.append('meta_hora', metaValorHora); 

    fetch('salvar_adm.php', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: data
    })
    .then(r => r.text())
    .then(msg => {
        if (msg.startsWith('✅ OK')) {
            showToast('✅ Meta SKU salva com sucesso!');
            if (listItem) {
                // Atualiza a exibição na lista
                listItem.querySelector('span strong:nth-child(1)').textContent = metaValorDiaria;
                listItem.querySelector('span strong:nth-child(2)').textContent = metaValorHora;
                
                const btnEdit = listItem.querySelector('.btnEdit');
                btnEdit.setAttribute('onclick', `abrirEditarMetaSku(${id}, '${htmlspecialchars(addslashes(skuNome))}', ${metaValorDiaria}, ${metaValorHora})`);
            }
        } else {
            showToast(msg, 'error');
        }
        toggleModal('modalEditarMetaSku', false);
    })
    .catch(e => {
        showToast('Erro de conexão ao salvar meta SKU: ' + e, 'error');
        toggleModal('modalEditarMetaSku', false);
    });
}

function filtrarItens(tabela, valor) {
    const termo = valor.toLowerCase();
    const lista = document.getElementById('lista' + toPascalCase(tabela));
    if (!lista) return;

    lista.querySelectorAll('li').forEach(li => {
        const span = li.querySelector('span');
        let nome = '';

        if (tabela === 'metas_sku') {
             const skuNome = li.getAttribute('data-nome-item') || '';
             nome = skuNome.toLowerCase() + ' ' + span.textContent.toLowerCase();
        } else {
            nome = span.textContent.toLowerCase();
            span.innerHTML = htmlspecialchars(span.textContent); 
        }
        

        if (nome.includes(termo) || termo === '') {
            li.style.display = 'flex'; 
            if (tabela !== 'metas_sku' && termo !== '') { 
                const regex = new RegExp(termo, 'gi');
                span.innerHTML = span.textContent.replace(regex, match => `<span class="highlight">${match}</span>`);
            }
        } else {
            li.style.display = 'none';
        }
    });
}


function htmlspecialchars(str) {
    if (typeof str !== 'string') return str;
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function addslashes(str) {
    return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0');
}
</script>
</body>
</html>