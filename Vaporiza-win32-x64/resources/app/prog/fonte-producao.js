const objControleCadProd = {
    nome: '',
    periodo: '',
    observacoes: '',
    fatorDias: [],
    feriados: [],
    produtosDias: [],
    quantidadeDias: [],
    acao: 'proximo'
};

function att_lista_produtos(dia, posicao) {
    const select = document.getElementById(`sel-dia-${dia}-${posicao}`);

    // Remove todo o conteúdo da lista
    let itensAtuais = [];
    select.childNodes.forEach(elemento => itensAtuais.push(elemento));
    itensAtuais.forEach(item => select.removeChild(item));

    // Preenche com os novos dados
    const produtos = gerente.getRef('produtos');
    produtos.forEach((produto, i) => {
        let op = document.createElement('option');
        op.appendChild(document.createTextNode(`${produto.nome} (${produto.unidade})`));
        op.value = i;
        select.appendChild(op);
    });
}

function cancelar_cadastro_producao() {
    const confirmacao = confirm('Deseja mesmo abandonar o cadastro de nova produção?');
    if(confirmacao) {
        resetCadProducao();
        renderDia();
        const label = document.getElementById('labelProxProducao');
        label.innerHTML = 'PRÓXIMO';
        document.getElementById('confDiasProducao').className = 'oculta';
        selecionarItem('apresentacao');
    }
}

function proximaFase() {
    if(objControleCadProd.acao == 'proximo') {
        gerenciar_dias();
    } else if(objControleCadProd.acao == 'finalizar') {
        salvar_producao();
    }
}

function gerenciar_dias() {
    // Inicia o vetor de erro
    const erros = [];

    // Verifica se o nome da semana foi adicionado
    const nome = document.getElementById('inputNomeCadProd').value.trim();
    if(nome.length < 5) {
        erros.push('Informe um nome com pelo menos 5 caracteres.');
    }

    // Verifica as datas
    const data_config = interpretaData();
    if(data_config.valor == -1) {
        erros.push(data_config.erro);
    }

    // Contabiliza os erros
    if(erros.length != 0) {
        let msg = 'Os seguintes erros foram encontrados:\n';
        erros.forEach(erro => msg += erro + '\n');
        alert(msg);
        return;
    }

    // Modifica o texto do botão e exibe o alerta
    const label = document.getElementById('labelProxProducao');
    label.innerHTML = 'FINALIZAR';
    objControleCadProd.acao = 'finalizar';
    alert('Por favor, configure os dias da produção informada.');

    // Impede a mudança dos dias
    document.getElementById('dataInicio').readOnly = true;
    document.getElementById('dataFim').readOnly = true;
    document.getElementById('inputNomeCadProd').readOnly = true;

    // Exibe a div com o conteúdo dos dias
    document.getElementById('confDiasProducao').className = 'janela';
    configurarDias();
}

function buscaDadosProdutosCadastrados() {
    const retorno = [];
    const produtos = gerente.getRef('produtos');
    for(let i = 0; i < produtos.length; i++) {
        retorno.push({ nome: produtos[i].nome, posicao: i });
    }
    return retorno;
}

function adicionarDia() {
    // Atualiza o objeto interno
    objControleCadProd.fatorDias.push([]);
    objControleCadProd.feriados.push(false)
    objControleCadProd.produtosDias.push([0]);
    objControleCadProd.quantidadeDias.push([0]);

    // Chama a função de render
    renderDia();
}

function interpretaData() {
    // Retorno
    const resposta = { valor: -1, erro: '' };

    // Recupera os valores dos inputs de data
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;

    // Verifica se existem valores
    if(dataInicio == '' || dataFim == '') {
        resposta.erro = 'Valores de data inválidos encontrados.';
    } else {
        // Intancia o Date
        const objInicio = new Date(dataInicio);
        const objFim = new Date(dataFim);
        const dias = (objFim - objInicio) / (1000 * 3600 * 24) + 1;

        // Fas as validações de data
        if(dias > 7) {
            resposta.erro = 'Intevalo de planejamento muito grande.';
        } else if(dias <= 0) {
            resposta.erro = 'Data de término anterior à data de início de produção.';
        } else {
            const producoes = gerente.getRef('producoes');
            let igual = false;
            for(let i = 0; i < producoes.length; i++) {
                let inicio = new Date(producoes[i].periodo.split('->')[0]);
                let fim = new Date(producoes[i].periodo.split('->')[1]);
                if(objFim - inicio >= 0) {
                    if(objInicio - fim <= 0) {
                        // Data existente
                        igual = true;
                        resposta.erro = `Na semana ${producoes[i].nome}, dia(s) do período já estão cadastrados.`;
                        break;
                    }
                }
            }
            if(!igual) resposta.valor = dias;
        }
    }
    return resposta;
}

function formatarData(posicao) {
    const inicio = new Date(document.getElementById('dataInicio').value);
    const nova = inicio.getTime() + (posicao + 1) * 24 * 60 * 60 * 1000;
    const data = new Date(nova);
    return data.toLocaleDateString();
}

function configurarDias() {
    // Recupera os valores e faz a validação
    const dias = interpretaData();

    // Carrega os dias relativos ao período informado
    const novosDias = dias.valor - objControleCadProd.fatorDias.length;
    for(let i = 0; i < Math.abs(novosDias); i++) {
        if(novosDias < 0) deletarDia(objControleCadProd.fatorDias.length - 1);
        else adicionarDia();
    }
}

function salvar_producao() {
    // Importa o prompt
    const prompt = require('electron-prompt');
    prompt({
        title: 'Para seguir com a adição, informe a senha de administrador.',
        label: 'Senha:',
        value: '',
        inputAttrs: {
            type: 'password'
        }
    }).then(resposta => {
        if(resposta == 'admin') {
            // Recolhe as informações dos inputs principais
            const nome = document.getElementById('inputNomeCadProd').value;
            const periodo = document.getElementById('dataInicio').value + '->' + document.getElementById('dataFim').value;
            let observacoes = document.getElementById('inputObservacoesCadProd').value;
            if(observacoes == '') {
                observacoes = 'Sem observações para a semana.';
            }
            let feriados = 0;

            // Monta o objeto de envio para o gerente
            const planejamento = { nome, periodo, feriados, observacoes, dias: [] };
            calcularConsumoProducao(planejamento);

            // Guarda o json no banco
            gerente.add('producoes', planejamento);

            // Limpa a tela
            resetCadProducao();
            renderDia();
            document.getElementById('labelProxProducao').innerHTML = 'PRÓXIMO';
            document.getElementById('confDiasProducao').className = 'oculta';

            // Disponibiliza os inputs para edição
            document.getElementById('dataInicio').readOnly = false;
            document.getElementById('dataFim').readOnly = false;
            document.getElementById('inputNomeCadProd').readOnly = false;

            alert('Cadastro de nova produção efetuado com sucesso');

            // Atualiza a exibição de planejamentos
            render_lista_planejamentos();
        }
    });
}

function resetCadProducao() {
    // Limpa os inputs de dados
    document.getElementById('inputNomeCadProd').value = '';
    document.getElementById('dataInicio').value = '';
    document.getElementById('dataFim').value = '';
    document.getElementById('inputObservacoesCadProd').value = '';

    // Limpa o objeto de cadastro
    objControleCadProd.nome = '';
    objControleCadProd.periodo = '';
    objControleCadProd.observacoes = '';
    objControleCadProd.fatorDias = [];
    objControleCadProd.produtosDias = [];
    objControleCadProd.quantidadeDias = [];
    objControleCadProd.acao = 'proximo';

    // Disponibiliza os inputs para edição
    document.getElementById('dataInicio').readOnly = false;
    document.getElementById('dataFim').readOnly = false;
    document.getElementById('inputNomeCadProd').readOnly = false;
}

function relacionarPTSaturacao(valor, tipo) {
    // Temperatura em °C e pressão em kPa
    const temperaturas = [0.01, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95];
    const pressoes = [0.6113, 0.8721, 1.2276, 1.7051, 2.339, 3.169, 4.246, 5.628, 7.384, 9.593, 12.349, 15.758, 19.940, 25.03, 31.19, 38.58, 47.39, 57.83, 70.14, 84.55];

    if(tipo == 'temperatura') {
        for(let i = 0; i < temperaturas.length - 1; i++) {
            if(valor >= temperaturas[i] && valor <= temperaturas[i + 1]) {
                return interpolar(temperaturas[i], temperaturas[i + 1], pressoes[i], pressoes[i + 1], valor);
            }
        }
        if(valor < temperaturas[0]) {
            return interpolar(temperaturas[0], temperaturas[1], pressoes[0], pressoes[1], valor);
        } else if(valor > temperaturas[temperaturas.length - 1]) {
            const n = temperaturas.length - 1;
            return interpolar(temperaturas[n], temperaturas[n - 1], pressoes[n], pressoes[n - 1], valor);
        }
    } else if(tipo == 'pressao') {
        for(let i = 0; i < pressoes.length - 1; i++) {
            if(valor >= pressoes[i] && valor <= pressoes[i + 1]) {
                return interpolar(pressoes[i], pressoes[i + 1], temperaturas[i], temperaturas[i + 1], valor);
            }
        }
        if(valor < pressoes[0]) {
            return interpolar(pressoes[0], pressoes[1], temperaturas[0], temperaturas[1], valor);
        } else if(valor > pressoes[pressoes.length - 1]) {
            const n = pressoes.length - 1;
            return interpolar(pressoes[n], pressoes[n - 1], temperaturas[n], temperaturas[n - 1], valor);
        }
    }
}

function interpolar(x1, x2, y1, y2, x) {
    return y1 - (x1 - x) * (y1 - y2) / (x1 - x2);
}

function calcularConsumoProducao(planejamento) {
    // Acessa as informações cadastradas de produtos e matérias primas
    const produtosCadastrados = gerente.getRef('produtos');
    const parametros = gerente.getParametros();
    planejamento.parametros = parametros;

    // Atualiza os valores de input de quantidades
    att_obj();

    // Percorre os dias cadastrados
    for(let i = 0; i < objControleCadProd.fatorDias.length; i++) {
        if(objControleCadProd.feriados[i]) {
            planejamento.feriados++;
            continue;
        }
        // Cria os atributos do json de planejamento por dia e outras variáveis intermediárias
        let label = formatarData(i);
        let segurancaValores = [];
        let seguranca = [];
        let produtos = [];
        let unidades = [];
        let quantidades = [];
        let consumo = [];
        let combustivel = [];

        // Recupera os valores dos fatores de segurança para o dia
        seguranca = objControleCadProd.fatorDias[i].slice();
        objControleCadProd.fatorDias[i].forEach(fator => {
            if(fator == 'Chuva') segurancaValores.push(parametros.ftChuva / 100);
            if(fator == 'Umidade') segurancaValores.push(parametros.ftUmidade / 100);
            if(fator == 'Frio') segurancaValores.push(parametros.ftFrio / 100);
        });
        let fator_seguranca = 1;
        segurancaValores.forEach(fator => fator_seguranca += fator);

        // Percorre os produtos cadastrados no dia
        for(let j = 0; j < objControleCadProd.produtosDias[i].length; j++) {
            produtos.push(produtosCadastrados[objControleCadProd.produtosDias[i][j]].nome);
            unidades.push(produtosCadastrados[objControleCadProd.produtosDias[i][j]].unidade);
            quantidades.push(objControleCadProd.quantidadeDias[i][j]);

            // Determina o consumo do produto
            let consumoProduto = produtosCadastrados[objControleCadProd.produtosDias[i][j]].consumo;
            let quantidadeProduto = objControleCadProd.quantidadeDias[i][j];
            let vapor = consumoProduto * quantidadeProduto * fator_seguranca;
            consumo.push(vapor);

            // Determina o gasto de combustível para a produção desse produto
            let h_vapor = NeutriumJS.thermo.IAPWS97.PT.solve(parametros.pressVapor / 1000, relacionarPTSaturacao(parametros.pressVapor, 'pressao') + 273.15).h;
            let h_agua = NeutriumJS.thermo.IAPWS97.PT.solve(0.1, parametros.tempAgua + 273.15).h;
            let quantidade_combustivel = vapor * (h_vapor - h_agua) / (parametros.eficiencia * parametros.pci / 100);
            combustivel.push(quantidade_combustivel);
        }

        // Adiciona o dia ao planejamento
        planejamento.dias.push({ seguranca, produtos, quantidades, consumo, label, unidades, combustivel });
    }
}

function att_obj() {
    // Recupera os valores das listas e dos inputs
    for(let i = 0; i < objControleCadProd.produtosDias.length; i++) {
        for(let j = 0; j < objControleCadProd.produtosDias[i].length; j++) {
            objControleCadProd.produtosDias[i][j] = parseInt(document.getElementById(`sel-dia-${i}-${j}`).value);
            objControleCadProd.quantidadeDias[i][j] = parseFloat(document.getElementById(`input-dia-${i}-${j}`).value.replace(',', '.'));
        }
    }
}

function renderDia() {
    // Remove todo o conteúdo existente
    const secao = document.getElementById('areDiasCadastrar');
    const filhos = [];
    secao.childNodes.forEach(node => filhos.push(node));
    filhos.forEach(node => secao.removeChild(node));

    // Percorre o objeto e preenche os dias
    for(let i = 0; i < objControleCadProd.fatorDias.length; i++) {
        let dia = document.createElement('div');
        dia.className = 'box-dia-producao header-fundo';
        dia.id = `dia-${i}`;
        secao.appendChild(dia);

        // Define os principais id's
        let idCheckChuva = `check-chuva-dia-${i}`;
        let idCheckUmidade = `check-umidade-dia-${i}`;
        let idCheckFrio = `check-frio-dia-${i}`;
        let idCheckFeriado = `check-feriado-dia-${i}`;

        // Define as ações de onchange das checkbox
        let atualizaCheck = () => {
            let selecionado = [];
            let posicaoDia = i;
            if(document.getElementById(idCheckChuva).checked) selecionado.push('Chuva');
            if(document.getElementById(idCheckUmidade).checked) selecionado.push('Umidade');
            if(document.getElementById(idCheckFrio).checked) selecionado.push('Frio');
            objControleCadProd.fatorDias[posicaoDia] = selecionado;
        };

        // Define o onchange da checkbox de feriado
        let atualiza_feriado = () => {
            objControleCadProd.feriados[i] = document.getElementById(idCheckFeriado).checked;
        };

        // Cria a seção de adição do dia
        let secaoDia = document.createElement('div');
        secaoDia.className = 'janela-formulario form-dia-producao separador-dia-producao f-m-d-p';
        dia.appendChild(secaoDia);

        // Cria o título e o check de dia não operacional
        let secaoTitulo = document.createElement('div');
        secaoTitulo.className = 'janela';
        secaoDia.appendChild(secaoTitulo);

        let tituloDia = document.createElement('span');
        tituloDia.className = 'fonte-roxa fonte-producao-dia';
        tituloDia.appendChild(document.createTextNode(`DIA ${i + 1}: ${formatarData(i)}`));
        secaoTitulo.appendChild(tituloDia);

        let feriado = document.createElement('label');
        let check = document.createElement('input');
        feriado.className = 'fonte-cinza-escuro fonte-producao-check';
        feriado.appendChild(check);
        check.type = 'checkbox'
        check.value = 'feriado';
        check.id = idCheckFeriado;
        check.addEventListener('click', atualiza_feriado);
        feriado.appendChild(document.createTextNode('DIA NÃO OPERACIONAL'));
        secaoTitulo.appendChild(feriado);

        // Cria seção de check
        let secaoCheck = document.createElement('div');
        secaoCheck.className = 'janela recuo-separador';
        secaoDia.appendChild(secaoCheck);

        let tituloCheck = document.createElement('span');
        tituloCheck.className = 'fonte-cinza-escuro fonte-producao-dia';
        tituloCheck.appendChild(document.createTextNode('PARÂMETROS DE PROJETO'));
        secaoCheck.appendChild(tituloCheck);

        let formCheck = document.createElement('div');
        formCheck.className = 'janela-formulario recuo-check';
        secaoCheck.appendChild(formCheck);

        let labelCheck = document.createElement('label');
        labelCheck.className = 'fonte-cinza-escuro fonte-producao-check';
        check = document.createElement('input');
        labelCheck.appendChild(check);
        check.type = 'checkbox'
        check.value = 'Chuva';
        check.id = idCheckChuva;
        check.addEventListener('click', atualizaCheck);
        labelCheck.appendChild(document.createTextNode('COM CHUVA'));
        formCheck.appendChild(labelCheck);

        labelCheck = document.createElement('label');
        labelCheck.className = 'fonte-cinza-escuro fonte-producao-check';
        check = document.createElement('input');
        labelCheck.appendChild(check);
        check.type = 'checkbox'
        check.value = 'Umidade';
        check.id = idCheckUmidade;
        check.addEventListener('click', atualizaCheck);
        labelCheck.appendChild(document.createTextNode('UMIDADE ELEVADA'));
        formCheck.appendChild(labelCheck);

        labelCheck = document.createElement('label');
        labelCheck.className = 'fonte-cinza-escuro fonte-producao-check';
        check = document.createElement('input');
        labelCheck.appendChild(check);
        check.type = 'checkbox'
        check.value = 'Frio';
        check.id = idCheckFrio;
        check.addEventListener('click', atualizaCheck);
        labelCheck.appendChild(document.createTextNode('FRIO'));
        formCheck.appendChild(labelCheck);

        // Atualiza o checkbox do cabeçalho
        objControleCadProd.fatorDias[i].forEach(fator => {
            if(fator == 'Chuva') document.getElementById(idCheckChuva).checked = true;
            else if(fator == 'Umidade') document.getElementById(idCheckUmidade).checked = true;
            else if(fator == 'Frio') document.getElementById(idCheckFrio).checked = true;
        });

        // Atualiza o check de feriado
        document.getElementById(idCheckFeriado).checked = objControleCadProd.feriados[i];

        // Preenche com os produtos cadastrados
        for(let j = 0; j < objControleCadProd.produtosDias[i].length; j++) {
            // Prepara a área para cadastro de produtos no dia
            let secaoProdutos = document.createElement('div');
            secaoProdutos.className = 'janela-formulario form-dia-producao';
            secaoProdutos.id = `conf-produtos-dia-${i}-${j}`;
            dia.appendChild(secaoProdutos);

            // Cria a lista de produtos
            let select = document.createElement('select');
            select.className = 'fonte-cinza-escuro texto-input input-simples select-produtos-producao';
            select.id = `sel-dia-${i}-${j}`;
            secaoProdutos.appendChild(select);
            att_lista_produtos(i, j);
            select.value = parseInt(objControleCadProd.produtosDias[i][j]);

            // Cria o primeiro input de quantidade
            let input = document.createElement('input');
            input.className = 'fonte-cinza-escuro texto-input input-simples';
            input.type = 'number';
            input.placeholder = 'Ex.: 45,5';
            input.id = `input-dia-${i}-${j}`;
            input.value = objControleCadProd.quantidadeDias[i][j];
            secaoProdutos.appendChild(input);

            // Cria o botão de adição
            let botao = document.createElement('img');
            botao.className = 'icone';
            secaoProdutos.appendChild(botao);

            // Cria a ação de adição
            let add = () => {
                // Verifica se o máximo de produtos já foi cadastrado
                let total = produtos = gerente.getRef('produtos').length;
                if(objControleCadProd.produtosDias[i].length == total) {
                    alert('Não é possível adicionar mais produtos, pois o número de produtos cadastrados internamente já foi atingido.');
                    return;
                }
                att_obj();
                objControleCadProd.produtosDias[i].push(0);
                objControleCadProd.quantidadeDias[i].push(0);
                renderDia();
            };

            // Cria a ação de remoção
            let del = () => {
                att_obj();
                objControleCadProd.produtosDias[i].splice(j, 1);
                objControleCadProd.quantidadeDias[i].splice(j, 1);
                renderDia();
            };

            // Faz a configuração final do botão
            if(j == 0) {
                botao.src = '../imagens/plus.svg';
                botao.addEventListener('click', add);
            } else {
                botao.src = '../imagens/minus.svg';
                botao.addEventListener('click', del);
            }
        }
    }
}
