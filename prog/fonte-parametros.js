render_tabela_materias();
inicializar_parametros('usuario');

function drop(item) {
    // Exibe a seção
    const secao = document.getElementById(item);
    const icone = document.getElementById(`icon-${item}`);
    const visivel = parseInt(secao.getAttribute('visivel'));

    if(visivel == 0) {
        // Exibe a seção de drop
        secao.className = 'janela secao-drop drop-conteudo';
        secao.setAttribute('visivel', 1);
        icone.src = '../imagens/minus-white.svg';
    } else if(visivel == 1) {
        // Esconde a seção de drop
        secao.className = 'janela secao-drop drop-conteudo oculta';
        secao.setAttribute('visivel', 0);
        icone.src = '../imagens/plus-white.svg';
    }
}

function inicializar_parametros(identificador) {
    // Verifica quais parâmetros serão inicializados
    let confirmacao = true;
    if(identificador == 'padrao') {
        gerente.initParametros();
        confirmacao = confirm('Deseja de fato retornar os parâmetros para os valores padrão?');
    }

    // Verifica a confirmação
    if(confirmacao) {
        // Recupera informações do gerente
        const { nome, responsavel, combustivel, pci, ftChuva,ftUmidade, ftFrio, tempAgua, pressVapor, eficiencia } = gerente.getParametros();
        const lista_valores = [nome, responsavel, combustivel, pci, ftChuva,ftUmidade, ftFrio, tempAgua, pressVapor, eficiencia];

        // Atualiza os inputs
        atualiza_inputs_parametros(lista_valores);
    }
}

function salvar_novos_parametros() {
    const confirmacao = confirm('Deseja prosseguir com a alteração dos parâmetros de sistema?');
    if(confirmacao) {
        // Recupera valores dos inputs
        const novos_parametros = recuperar_valores_input_parametros();

        // Faz a verificação de erros
        const erros = verificar_erros_parametros(novos_parametros);
        if(erros.length != 0) {
            let msg = 'Os seguintes erros foram encontrados:\n';
            erros.forEach(erro => msg += erro + '\n');
            alert(msg);
            return;
        }

        // Envia para o gerente
        gerente.setParametros(novos_parametros);

        // Atualiza os inputs
        inicializar_parametros('usuario');
    }
}

function atualiza_inputs_parametros(lista_valores) {
    const ids = ['nomeEmpresa', 'nomeResponsavel', 'nomeCombustivel', 'pci', 'chuva', 'umidade', 'frio', 'tpAgua', 'psVapor', 'efiCaldeira'];
    for(let i = 0; i < ids.length; i++) {
        document.getElementById(ids[i]).value = lista_valores[i];
    }
}

function recuperar_valores_input_parametros() {
    const valores = {
        nome: document.getElementById('nomeEmpresa').value.trim(),
        pci: parseFloat(document.getElementById('pci').value.replace(',', '.')),
        ftChuva: parseFloat(document.getElementById('chuva').value.replace(',', '.')),
        ftUmidade: parseFloat(document.getElementById('umidade').value.replace(',', '.')),
        ftFrio: parseFloat(document.getElementById('frio').value.replace(',', '.')),
        tempAgua: parseFloat(document.getElementById('tpAgua').value.replace(',', '.')),
        pressVapor: parseFloat(document.getElementById('psVapor').value.replace(',', '.')),
        eficiencia: parseFloat(document.getElementById('efiCaldeira').value.replace(',', '.')),
        responsavel: document.getElementById('nomeResponsavel').value.trim(),
        combustivel: document.getElementById('nomeCombustivel').value.trim()
    };

    return valores;
}

function verificar_erros_parametros(parametros) {
    const erros = [];
    if(parametros.nome.length == 0) {
        erros.push('O nome da empresa está em branco.');
    }
    if(parametros.responsavel.length == 0) {
        erros.push('O nome do responsável pela produção está em branco.');
    }
    if(parametros.combustivel.length == 0) {
        erros.push('O nome do combustível está em branco.');
    }
    if(parametros.pci <= 0 || isNaN(parametros.pci)) {
        erros.push('Valor inválido para PCI.');
    }
    if(parametros.ftChuva < 0 || parametros.ftChuva > 100 || isNaN(parametros.ftChuva)) {
        erros.push('Valor inválido para o critério de projeto para dias de chuva.');
    }
    if(parametros.ftUmidade < 0 || parametros.ftUmidade > 100 || isNaN(parametros.ftUmidade)) {
        erros.push('Valor inválido para o critério de projeto para dias úmidos.');
    }
    if(parametros.ftFrio < 0 || parametros.ftFrio > 100 || isNaN(parametros.ftFrio)) {
        erros.push('Valor inválido para o critério de projeto para dias chuvosos.');
    }
    if(parametros.tempAgua <= 0 || isNaN(parametros.tempAgua)) {
        erros.push('Valor inválido para a temperatura de entrada da água.');
    }
    if(parametros.pressVapor <= 0 || isNaN(parametros.pressVapor)) {
        erros.push('Valor inválido para pressão do vapor de saída.');
    }
    if(parametros.eficiencia <= 0 || parametros.eficiencia > 100 || isNaN(parametros.eficiencia)) {
        erros.push('Valor inválido para eficiêcia da caldeira.');
    }
    return erros;
}

function render_tabela_materias() {
    // Objeto de criação de elementos node
    const layout = new Layout();

    // Recupera div de inserção e apaga o seu conteúdo
    const idDiv = 'listMatPar';
    const campo = document.getElementById(idDiv);
    layout.excluirFilhos({ idDiv });

    // Monta as listas com conteúdos da tabela
    const titulos = [
        layout.criarTexto({ texto: 'MATÉRIA-PRIMA' }),
        layout.criarTexto({ texto: 'UNIDADE' }),
        layout.criarTexto({ texto: 'AÇÃO' })
    ];
    const conteudo = [];

    // Percorre as matérias cadastradas
    const materias = gerente.getRef('materias');
    materias.forEach((materia, i) => {
        // Cria os elementos de cada linha da tabela
        let nome = layout.criarTexto({ texto: materia.nome });
        let unidade = layout.criarTexto({ texto: materia.unidade });
        let acao = layout.criarImagem({ src: '../imagens/cancel.svg', classe: 'icone' });

        // Implementa a ação de click do botão
        let del = () => {
            // Verifica se a matéria está cadastrada em algum produto
            let possivel_deletar = true;
            const produtos = gerente.getRef('produtos');
            for(let j = 0; j < produtos.length; j++) {
                for(let k = 0; k < produtos[j].materias.length; k++) {
                    if(produtos[j].materias[k] == materias[i].nome) {
                        possivel_deletar = false;
                    }
                }
            }

            if(!possivel_deletar) {
                alert('Esta matéria está cadastrada em um produto, não é possível deletá-la.');
                return;
            }

            // Computa a senha
            const prompt = require('electron-prompt');
            prompt({
                title: 'Para seguir com a exclusão, informe a senha de administrador.',
                label: 'Senha:',
                value: '',
                inputAttrs: { type: 'password' }
            }).then(senha => {
                if(senha == 'admin') {
                    gerente.del('materias', i);
                    render_tabela_materias();
                    alert('Matéria-prima excluída com sucesso.');
                }
            });
        };
        acao.addEventListener('click', del);

        conteudo.push([nome, unidade, acao]);
    });

    // Finaliza a construção da tabela
    const tabela = layout.criarTabela({
        titulos,
        conteudo,
        classe: 'secao-tabela-parametros texto-tabela fonte-cinza-escuro',
        classeHeader: 'celula-tabela header-tabela fonte-branca',
        classeCelula: 'celula-tabela'
    });
    campo.appendChild(tabela);
}

function add_materia() {
    // Recupera dados dos inputs e select
    const nome = document.getElementById('inputNomePar').value.trim();
    const unidade = document.getElementById('unidadeMateriaCad').value;

    // Inicializa o vetor de erro
    const erros = [];

    // Valida o nome informado
    if(nome.length < 5) {
        erros.push('Informe um nome com pelo menos 5 caracteres.');
    }
    let nome_valido = true;
    const materias = gerente.getRef('materias');
    materias.forEach(materia => {
        if(materia.nome == nome) {
            nome_valido = false;
        }
    });
    if(!nome_valido) {
        erros.push('O nome informado já está cadastrado, por favor informe outro.');
    }

    // Exibe o log de erros para o usuário
    if(erros.length != 0) {
        let msg = 'Os seguintes erros foram encontrados:\n';
        erros.forEach(erro => msg += erro + '\n');
        alert(msg);
        return;
    }

    // Faz o envio para o gerente
    const novo = { nome, unidade };
    gerente.add('materias', novo);

    // Atualiza a lista
    render_tabela_materias();

    // Limpa os campos de entrada de dados
    document.getElementById('inputNomePar').value = '';
    document.getElementById('unidadeMateriaCad').value = 'Unidades';
}