atualizaListaMaterias(0);
render_tabela_produtos();

const objTempProd = {
    materia: [],
    quantidade: []
};

const dadosTempProd = {
    base: 'janMatCadNovProd',
    ref: 1,
    ids: [],
    cont: 1
};

function resetCadProd() {
    limpaInputsCadProd();
    selecionarItem('apresentacao');
}

function limpaInputsCadProd() {
    document.getElementById('consumoCadProduto').value = '';
    document.getElementById('nomeCadProd').value = '';
    document.getElementById(`input-${dadosTempProd.base}-0`).value = '';
    const secao = document.getElementById(dadosTempProd.base);
    dadosTempProd.ids.forEach(id => {
        const div = document.getElementById(`form-${id}`);
        secao.removeChild(div);
    });
    dadosTempProd.ref = 1;
    dadosTempProd.cont = 1;
    dadosTempProd.ids = [];
}

function addNovProd() {
    // Inicializa o vetor de erros
    const erros = [];

    // Recupera informações do novo produto
    const nome = document.getElementById('nomeCadProd').value.trim();
    const unidade = document.getElementById('unidadeProdutoCad').value
    const consumoVapor = parseFloat(document.getElementById('consumoCadProduto').value.replace(',', '.'));

    // Valida os dados de novo produto
    if(nome.length < 5) {
        erros.push('É preciso que o novo nome possua ao menos 5 caracteres.');
    }
    if(isNaN(consumoVapor) || consumoVapor <= 0) {
        erros.push('O consumo de vapor informado não é válido.');
    }

    // Recupera informações dos selects e inputs
    const matAd = [];
    const quantAd = [];
    let select = document.getElementById(`sel-${dadosTempProd.base}-0`);
    let input = document.getElementById(`input-${dadosTempProd.base}-0`);
    let materiaPrima = select.options[select.selectedIndex].innerHTML.split(' (')[0];
    let quantidade = parseFloat(input.value.replace(',', '.'));
    matAd.push(materiaPrima);
    quantAd.push(quantidade);
    for(let i = 0; i < dadosTempProd.ids.length; i++) {
        select = document.getElementById(`sel-${dadosTempProd.ids[i]}`);
        input = document.getElementById(`input-${dadosTempProd.ids[i]}`);
        materiaPrima = select.options[select.selectedIndex].innerHTML.split(' (')[0];
        quantidade = parseFloat(input.value.replace(',', '.'));
        matAd.push(materiaPrima);
        quantAd.push(quantidade);
    }

    // Valida se os valores são válidos
    for(let i = 0; i < quantAd.length; i++) {
        if(isNaN(quantAd[i]) || quantAd[i] <= 0) {
            erros.push(`A quantidade informada para a matéria ${matAd[i]} é inválido.`);
        }
    }

    // Verifica se as matérias primas são iguais
    const repeticoes = [];
    for(let i = 0; i < matAd.length; i++) {
        for(let j = 0; j < matAd.length; j++) {
            if(i != j && matAd[i] == matAd[j]) {
                if(repeticoes.indexOf(matAd[i]) == -1) {
                    erros.push(`A matéria ${matAd[i]} foi cadastrada mais de uma vez.`);
                    repeticoes.push(matAd[i]);
                }
            }
        }
    }

    // Informa no caso de existência de erros
    if(erros.length != 0) {
        let info = 'Alguns erros foram encontrados, que impossibilitaram a conclusão da adição de novo produto.\n';
        for(let i = 0; i < erros.length; i++) {
            info += erros[i] + '\n';
        }
        alert(info);
        return;
    }

    // Atualiza o objeto global
    const novo = { nome, unidade, materias: matAd.slice(), quantidades: quantAd.slice(), consumo: consumoVapor };
    gerente.add('produtos', novo);

    // Restaura os campos
    limpaInputsCadProd();

    // Atualiza a tabela com os produtos cadastrados
    render_tabela_produtos();

    // Exibe alerta
    alert('O novo produto foi cadastrado com sucesso.');
}

function render_tabela_produtos() {
    // Objeto de criação de elementos node
    const layout = new Layout();

    // Recupera div de inserção e apaga o seu conteúdo
    const idDiv = 'campoTabela';
    const campo = document.getElementById(idDiv);
    layout.excluirFilhos({ idDiv });

    // Monta as listas com conteúdos da tabela
    const titulos = [
        layout.criarTexto({ texto: 'PRODUTO' }),
        layout.criarTexto({ texto: 'MATÉRIAS-PRIMA' }),
        layout.criarTexto({ texto: 'VAPOR (kg/Unidade de Produto)' }),
        layout.criarTexto({ texto: 'AÇÃO' })
    ];
    const conteudo = [];

    // Percorre os produtos cadastrados
    const produtos = gerente.getRef('produtos');
    produtos.forEach((produto, i) => {
        // Recupera informações sobre o produto
        let nome = produto.nome;
        let unidade = produto.unidade;
        let consumo = produto.consumo.toString().replace('.', ',');

        // Preenche as informações sobre as matérias primas
        let materias = layout.criarDiv();
        for(let i = 0; i < produto.materias.length; i++) {
            let dados = gerente.getDadosMateria(produto.materias[i]);
            let quantidade = produto.quantidades[i];
            let linha = document.createTextNode(`${dados.nome}: ${quantidade.toString().replace('.', ',')} ${dados.unidade}`);
            materias.appendChild(linha);
            if(i != produto.materias.length - 1) materias.appendChild(layout.criarQuebra());
        }

        // Cria o botão de exclusão
        let acao = document.createElement('img');
        acao.src = '../imagens/cancel.svg';
        acao.className = 'icone';

        // Implementa a ação de exclusão de produto
        let del = () => {
            // Verifica se é possível excluir o produtos
            const producoes = gerente.getRef('producoes');
            let em_planejamento = [];
            producoes.forEach(planejamento => {
                planejamento.dias.forEach(dia => {
                    dia.produtos.forEach(produtoDia => {
                        if(produtoDia == nome && em_planejamento.indexOf(planejamento.nome) == -1) {
                            em_planejamento.push(planejamento.nome);
                        }
                    });
                });
            });
            if(em_planejamento.length > 0) {
                let msg = 'Não é possível deletar esse produto, pois ele está cadastrado nos seguintes planejamentos:\n';
                em_planejamento.forEach(planejamento => msg += `${planejamento}.\n`);
                alert(msg);
                return;
            }

            // Computa a senha
            const prompt = require('electron-prompt');
            prompt({
                title: 'Para seguir com a exclusão, informe a senha de administrador.',
                label: 'Senha:',
                value: '',
                inputAttrs: {
                    type: 'password'
                }
            }).then(senha => {
                if(senha == 'admin') {
                    gerente.del('produtos', i);
                    render_tabela_produtos();
                    alert('Produto excluído com sucesso.');
                }
            });
        };
        acao.addEventListener('click', del);

        // Finaliza a adição dos componentes node na lista de conteúdo
        conteudo.push([
            layout.criarTexto({ texto: `${nome} (${unidade})` }),
            materias,
            layout.criarTexto({ texto: consumo }),
            acao
        ]);
    });

    // Finaliza a construção da tabela
    const tabela = layout.criarTabela({
        titulos,
        conteudo,
        classe: 'secao-tabela texto-tabela fonte-cinza-escuro',
        classeHeader: 'celula-tabela header-tabela fonte-branca',
        classeCelula: 'celula-tabela'
    });
    campo.appendChild(tabela);
}

function atualizaListaMaterias(posicao) {
    const select = document.getElementById(`sel-janMatCadNovProd-${posicao}`);

    // Remove todo o conteúdo da lista
    let itensAtuais = [];
    select.childNodes.forEach(elemento => itensAtuais.push(elemento));
    itensAtuais.forEach(item => select.removeChild(item));

    // Preenche com os novos dados
    const materias = gerente.getRef('materias');
    materias.forEach((materia, i) => {
        let op = document.createElement('option');
        op.appendChild(document.createTextNode(`${materia.nome} (${materia.unidade})`));
        op.value = i;
        select.appendChild(op);
    });
}

function addTopMat() {
    // Flag de controle, máximo de adições
    const total = gerente.getRef('materias').length;
    if(dadosTempProd.ref == total) {
        alert('Não existem tantas matérias cadastradas no sistema, por isso não será possível adicionar um campo para mais uma matéria-prima para este produto.');
        return;
    }

    const idBase = dadosTempProd.base;
    const secao = document.getElementById(idBase);

    // Cria o novo formulário
    const pos = dadosTempProd.cont;
    const formulario = document.createElement('div');
    formulario.className = 'janela-formulario';
    formulario.id = `form-${idBase}-${pos}`;

    // Label das matérias
    const labelMat = document.createElement('span');
    labelMat.className = 'fonte-cinza-escuro texto-label';
    labelMat.appendChild(document.createTextNode('MATÉRIA-PRIMA'));
    formulario.appendChild(labelMat);

    // Select das matérias
    const select = document.createElement('select');
    select.className = 'fonte-cinza-escuro texto-input input-simples';
    select.id = `sel-${idBase}-${pos}`;
    formulario.appendChild(select);

    // Label da quantidade
    const labelQuant = document.createElement('span');
    labelQuant.className = 'fonte-cinza-escuro texto-label recuo-label';
    labelQuant.appendChild(document.createTextNode('QUANTIDADE'));
    formulario.appendChild(labelQuant);

    // Imput da quantidade
    const input = document.createElement('input');
    input.className = 'fonte-cinza-escuro texto-input input-simples';
    input.type = 'number';
    input.placeholder = 'Ex. 23';
    input.id = `input-${idBase}-${pos}`;
    formulario.appendChild(input);

    // Ícone de exclusão
    const exc = document.createElement('img');
    const exc_fun = () => {
        const id = `form-${idBase}-${pos}`;
        const div = document.getElementById(id);
        secao.removeChild(div);
        dadosTempProd.ref--;
        dadosTempProd.ids.splice(dadosTempProd.ids.indexOf(`${idBase}-${pos}`), 1);
    };
    exc.className = 'recuo-label icone';
    exc.src = '../imagens/cancel.svg';
    exc.addEventListener('click', exc_fun);
    formulario.appendChild(exc);

    // Finaliza
    secao.appendChild(formulario);
    atualizaListaMaterias(pos);
    dadosTempProd.cont++;
    dadosTempProd.ref++;
    dadosTempProd.ids.push(`${idBase}-${pos}`);
}
