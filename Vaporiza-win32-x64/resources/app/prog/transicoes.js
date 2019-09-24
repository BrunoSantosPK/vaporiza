function logoff() {
    const confirmacao = confirm("Deseja realmente sair do programa?");
    if(confirmacao) window.location.href = "../index.html";
}

function selecionarItem(item) {
    // Redireciona o fluxo para função de atualização
    atualizarItemAtivo(item);
}

function atualizarItemAtivo(novoItem) {
    // Recupera todos os itens em uma lista, resetando a classe
    let itens = document.getElementsByTagName('itens');
    for(let i = 0; i < itens.length; i++) {
        itens[i].className = 'item-menu fonte-cinza-escuro fonte-menu-principal';
    }

    // Ilumina o item selecionado
    document.getElementById(novoItem).className = 'item-menu fonte-menu-principal item-menu-ativo';

    // De acordo com a página, faz o init dos valores
    if(novoItem == 'produto') {
        atualizaListaMaterias(0);
        render_tabela_produtos();
    }

    // Troca a visualização
    atualizarVisualizacao(novoItem);
}

function atualizarVisualizacao(item) {
    let secoes = document.getElementsByTagName('secao');
    for(let i = 0; i < secoes.length; i++) {
        secoes[i].className = 'janela janela-secao oculta';
    }
    document.getElementById(`janela-${item}`).className = 'janela janela-secao';
    if(item == 'apresentacao') document.getElementById(`janela-${item}`).className = 'janela janela-apresentacao';
}
