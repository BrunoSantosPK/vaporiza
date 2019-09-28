render_lista_planejamentos();

function render_lista_planejamentos() {
    // Busca as produções cadastradas
    const producoes = gerente.getRef('producoes');

    // Objeto de criação de elementos node
    const layout = new Layout();

    // Recupera div de inserção e apaga o seu conteúdo
    const idDiv = 'listaProducoesView';
    const secao = document.getElementById(idDiv);
    layout.excluirFilhos({ idDiv });

    // Monta as listas com conteúdos da tabela
    const titulos = [
        layout.criarTexto({ texto: 'SEMANA' }),
        layout.criarTexto({ texto: 'PERÍODO' }),
        layout.criarTexto({ texto: 'VAPOR TOTAL (kg)' }),
        layout.criarTexto({ texto: 'AÇÃO' })
    ];
    const conteudo = [];

    // Compõe as linhas da tabela
    producoes.forEach((producao, i) => {
        let nome = producao.nome;
        let periodo = producao.periodo.split('->');
        let consumoTotal = 0;
        let acao = layout.criarDiv();
        let ver = layout.criarImagem({ src: '../imagens/visualizar.svg', classe: 'icone' });
        let excluir = layout.criarImagem({ src: '../imagens/cancel.svg', classe: 'recuo-label icone' });
        acao.appendChild(ver);
        acao.appendChild(excluir);

        // Encontra o consumo total
        for(let j = 0; j < producao.dias.length; j++) {
            for(let k = 0; k < producao.dias[j].consumo.length; k++) {
                consumoTotal += producao.dias[j].consumo[k];
            }
        }

        // Implementa a ação de visualização de detalhes da produção
        let visualizar = () => abrir_planejamento(i);
        ver.addEventListener('click', visualizar);

        // Implementa a deleção de planejamento
        let deletar = () => {
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
                    gerente.del('producoes', i);
                    render_lista_planejamentos();
                    alert('Planejamento excluído com sucesso.');
                }
            });
        };
        excluir.addEventListener('click', deletar);

        // Formata o período para o padrão brasileiro
        let inicio = periodo[0].split('-');
        let fim = periodo[1].split('-');
        periodo = `${inicio[2]}/${inicio[1]}/${inicio[0]} até ${fim[2]}/${fim[1]}/${fim[0]}`;

        // Adiciona os valores na matriz
        conteudo.push([
            layout.criarTexto({ texto: nome }),
            layout.criarTexto({ texto: periodo }),
            layout.criarTexto({ texto: consumoTotal.toFixed(3).replace('.', ',') }),
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
    secao.appendChild(tabela);
}

function abrir_planejamento(posicao) {
    // Cria json de conteúdo, para preenchimento
    const planejamento = gerente.getRef('producoes')[parseInt(posicao)];
    const conteudo = { titulo: "RELATÓRIO VAPORIZA", elementos: [] };

    // Título, período, dias cadastrados, dias parados e observações
    gerar_apresentacao(planejamento, conteudo.elementos);

    // Parâmetros internos, de cálculo
    gerar_parametros_calculo(planejamento, conteudo.elementos);

    // Tabela: data, produtos, critérios de projeto, vapor total do dia
    gerar_producao(planejamento, conteudo.elementos);

    // Tabela: data, consumo de vapor total, consumo de combustível total, vapor/combustível
    gerar_tabela_vapor_combustivel(planejamento, conteudo.elementos);

    // Gráfico: Vapor total consumido e combustível total consumido vs dias cadastrados
    gerar_grafico_consumo_diario(planejamento, conteudo.elementos);

    // Tabela: material, consumo total, porcentagem consumida
    gerar_descricao_materias(planejamento, conteudo.elementos);

    // Tabela: produto, consumo total de vapor, consumo total de combustível e porcentagem de consumo
    gerar_descricao_produtos(planejamento, conteudo.elementos);

    // Gráfico: Vapor consumido e Combustível consumido vs produtos produzidos
    gerar_grafico_consumo_por_produto(planejamento, conteudo.elementos);

    // Envia para o localStorage e chama a tela de exibição
    localStorage.setItem("dados", JSON.stringify(conteudo));
    window.open("../frameworks/pdf/view_pdf.html", "", "width=850,height=500");
}

function gerar_apresentacao(planejamento, lista) {
    // Recupera informações gerais do planejamento
    const nome = planejamento.nome;
    const dias = `${planejamento.dias.length} (${planejamento.feriados} feriados)`;
    const observacoes = planejamento.observacoes;
    let periodo = planejamento.periodo.split('->');
    let inicio = periodo[0].split('-');
    let fim = periodo[1].split('-');
    periodo = `${inicio[2]}/${inicio[1]}/${inicio[0]} até ${fim[2]}/${fim[1]}/${fim[0]}`;

    // Preenche a lista de elementos a serem criados na tela
    lista.push({
        tipo: "titulo",
        cont: `RELATÓRIO GERAL DO PLANEJAMENTO - ${nome}`
    });
    lista.push({
        tipo: "paragrafo",
        cont: "Relatório de planejamento gerado pelo Vaporiza. Informações básicas abaixo."
    });
    lista.push({
        tipo: "tabela",
        legenda: false,
        rotulos: ["Período", "Dias Cadastrados"],
        linhas: [[periodo, dias]]
    });
    lista.push({
        tipo: "tabela",
        legenda: false,
        rotulos: ["Observações"],
        linhas: [[observacoes]]
    });
}

function gerar_parametros_calculo(planejamento, lista) {
    // Recupera informações dos parâmetros
    //{"nome":"Vaporiza","pci":9623.2,"ftChuva":10,"ftUmidade":5,"ftFrio":15,"tempAgua":40,"pressVapor":490.332,"eficiencia":80,"responsavel":"Bruno Santos","combustivel":"Eucalipto"}
    const { pci, ftChuva, ftUmidade, ftFrio, tempAgua, pressVapor, eficiencia, responsavel, combustivel, nome } = planejamento.parametros;

    /*const nome = planejamento.nome;
    const dias = `${planejamento.dias.length} (${planejamento.feriados} feriados)`;
    const observacoes = planejamento.observacoes;
    let periodo = planejamento.periodo.split('->');
    let inicio = periodo[0].split('-');
    let fim = periodo[1].split('-');
    periodo = `${inicio[2]}/${inicio[1]}/${inicio[0]} até ${fim[2]}/${fim[1]}/${fim[0]}`;*/

    // Preenche a lista de elementos a serem criados na tela
    lista.push({
        tipo: "tabela",
        legenda: true,
        titulo: "Dados da Empresa",
        rotulos: ["Nome", "Responsável"],
        linhas: [[nome, responsavel]]
    });
    lista.push({
        tipo: "tabela",
        legenda: true,
        titulo: "Geração de Vapor",
        rotulos: ["Combustível", "PCI (kJ/kg)", "Temp. Água (°C)", "Pressão Vapor (kPa)", "Eficiência Caldeir (%)"],
        linhas: [[combustivel,
            pci.toString().replace(".", ","),
            tempAgua.toString().replace(".", ","),
            pressVapor.toString().replace(".", ","),
            eficiencia.toString().replace(".", ",")]]
    });
    lista.push({
        tipo: "tabela",
        legenda: true,
        titulo: "Parâmetros de Projeto",
        rotulos: ["Dias com Chuva (%)", "Dias Frios (%)", "Dias Úmidos (%)"],
        linhas: [[ftChuva.toString().replace(".", ","),
            ftFrio.toString().replace(".", ","),
            ftUmidade.toString().replace(".", ",")]]
    });
}

function gerar_producao(planejamento, lista) {
    // Recupera valores
    const nome = planejamento.nome;
    const rotulos = ["Data", "Produtos", "Critério de Projeto", "Vapor Total (kg)"];
    const linhas = [];
    for(let i = 0; i < planejamento.dias.length; i++) {
        let produtos = "";
        let fatores = "";
        let vaporTotal = 0;

        // Recupera dados de cada produto cadastrado no dia
        for(let j = 0; j < planejamento.dias[i].produtos.length; j++) {
            produtos += `${planejamento.dias[i].produtos[j]}: ${planejamento.dias[i].quantidades[j]} ${planejamento.dias[i].unidades[j]}`;
            if(j != planejamento.dias[i].produtos.length - 1) produtos += '<br>';
            vaporTotal += planejamento.dias[i].consumo[j];
        }

        // Recupera os fatores de segurança utilizados
        for(let j = 0; j < planejamento.dias[i].seguranca.length; j++) {
            fatores += planejamento.dias[i].seguranca[j];
            if(j != planejamento.dias[i].seguranca.length - 1) fatores += '<br>';
        }

        linhas.push([
            planejamento.dias[i].label,
            produtos,
            fatores,
            vaporTotal.toFixed(3).replace('.', ',')
        ]);
    }

    // Preenche a lista de elementos a serem criados
    lista.push({
        tipo: 'subtitulo',
        cont: 'Dados de Produção'
    });
    lista.push({
        tipo: 'paragrafo',
        cont: `Demonstrativo de consumo para a produção (${nome}). Dias não operacionais (feriado) não foram contabilizados.`
    });
    lista.push({
        tipo: 'tabela',
        legenda: true,
        titulo: 'Visão geral da produção: produtos cadastrados e consumo de vapor, em cada dia',
        rotulos,
        linhas
    });
}

function gerar_descricao_materias(planejamento, lista) {
    // Buscar todas as matérias primas utilizadas
    const materias = [];
    const aparicoes = [];
    const consumo = [];
    const unidades = [];
    planejamento.dias.forEach(dia => {
        dia.produtos.forEach((produto, j) => {
            let dados_produto = gerente.getDadosProduto(produto);
            dados_produto.materias.forEach((materia, i) => {
                let dados_materia = gerente.getDadosMateria(materia);
                if(materias.indexOf(materia) == -1) {
                    materias.push(dados_materia.nome);
                    unidades.push(dados_materia.unidade);
                    consumo.push(dados_produto.quantidades[i] * dia.quantidades[j]);
                    aparicoes.push(1);
                } else {
                    aparicoes[materias.indexOf(materia)]++;
                    consumo[materias.indexOf(materia)] += dados_produto.quantidades[i] * dia.quantidades[j];
                }
            });
        });
    });
    let aparicoesTotais = 0;
    aparicoes.forEach(quantidade => aparicoesTotais += quantidade);

    // Monta a matriz de dados para criação da tabela
    const linhas = [];
    const rotulos = ['Matéria', 'Consumo Total', 'Frequência de Uso (%)']
    for(let i = 0; i < materias.length; i++) {
        linhas.push([
            materias[i],
            `${consumo[i].toString().replace('.', ',')} ${unidades[i]}`,
            (aparicoes[i] * 100 / aparicoesTotais).toFixed(3).replace('.', ',')
        ]);
    }

    // Monta as informações que serão enviadas para criação de elementos na tela
    lista.push({
        tipo: 'tabela',
        legenda: true,
        titulo: 'Descrição das matérias-prima utilizadas durante a produção',
        rotulos,
        linhas
    });
}

function gerar_descricao_produtos(planejamento, lista) {
    // Recupera valores
    const produtos = [];
    const vapor = [];
    const combustivel = [];
    const porcentagemConsumo = [];
    planejamento.dias.forEach(dia => {
        dia.produtos.forEach((produto, i) => {
            let dados_produto = gerente.getDadosProduto(produto);
            let posicao = produtos.indexOf(produto);
            if(posicao == -1) {
                produtos.push(dados_produto.nome);
                vapor.push(dia.consumo[i]);
                combustivel.push(dia.combustivel[i]);
            } else {
                vapor[posicao] += dia.consumo[i];
                combustivel[posicao] += dia.combustivel[i];
            }
        });
    });
    let vaporTotal = 0;
    vapor.forEach(valor => vaporTotal += valor);
    vapor.forEach(valor => porcentagemConsumo.push(valor * 100 / vaporTotal));

    // Prepara os dados para exibição da tabela
    const rotulos = ['Produto', 'Vapor (kg)', "Combustível (kg)", 'Porcentagem de Consumo'];
    const linhas = [];
    for(let i = 0; i < produtos.length; i++) {
        linhas.push([
            produtos[i],
            vapor[i].toFixed(2).replace('.', ','),
            combustivel[i].toFixed(2).replace('.', ','),
            porcentagemConsumo[i].toFixed(3).replace('.', ',')
        ]);
    }

    // Atualiza a lista com as informações para criação de elementos em tela
    lista.push({
        tipo: 'tabela',
        legenda: true,
        titulo: 'Relação de produtos e consumo de vapor',
        rotulos,
        linhas
    });
}

function gerar_tabela_vapor_combustivel(planejamento, lista) {
    // Recupera valores
    const data = [];
    const vapor = [];
    const combustivel = [];
    planejamento.dias.forEach(dia => {
        let soma_vapor = 0;
        let soma_combustivel = 0;
        for(let i = 0; i < dia.consumo.length; i++) {
            soma_vapor += dia.consumo[i];
            soma_combustivel += dia.combustivel[i];
        }
        data.push(dia.label);
        vapor.push(soma_vapor);
        combustivel.push(soma_combustivel);
    });

    // Prepara os dados para a tabela
    const rotulos = ['Data', 'Vapor Consumido (kg)', 'Combustível (kg)', 'Vapor / Combustível'];
    const linhas = [];
    for(let i = 0; i < data.length; i++) {
        linhas.push([
            data[i],
            vapor[i].toFixed(3).replace('.', ','),
            combustivel[i].toFixed(3).replace('.', ','),
            (vapor[i] / combustivel[i]).toFixed(3).replace('.', ',')
        ]);
    }

    // Atualiza a lista de elementos a serem renderizados
    lista.push({
        tipo: 'tabela',
        legenda: true,
        titulo: 'Consumo de vapor e combustível por dia cadastrado.',
        rotulos,
        linhas
    });
}

function gerar_grafico_consumo_diario(planejamento, lista) {
    // Recupera valores do planejamento
    const eixoX = [];
    const eixoY = [[], []];
    let max_eixo1 = 0;
    let max_eixo2 = 0;
    planejamento.dias.forEach(dia => {
        eixoX.push(dia.label);
        let vapor = 0;
        let combustivel = 0;
        for(let i = 0; i < dia.produtos.length; i++) {
            vapor += dia.consumo[i];
            combustivel += dia.combustivel[i];
        }
        eixoY[0].push(vapor);
        eixoY[1].push(combustivel);

        // Encontra o valor máximo dos eixos y
        if(vapor > max_eixo1) max_eixo1 = vapor;
        if(combustivel > max_eixo2) max_eixo2 = combustivel;
    });


    // Atualiza a lista de elementos a serem renderizados
    lista.push({
        tipo: 'paragrafo',
        cont: 'Relação entre o vapor consumido (eixo da esquerda) e o combustível gasto (eixo da direita), para cada dia de produção.'
    });
    lista.push({
        tipo: 'grafico',
        valoresX: eixoX,
        valoresY: eixoY,
        legendas: ['Vapor', 'Combustível'],
        tipoExibicao: ['line', 'line'],
        cores: ['rgb(225,123,44)', 'rgb(135,20,83)'],
        eixo: ['1', '2'],
        tituloEixoX: 'Dias de produção',
        tituloEixoY1: 'Vapor (kg)',
        tituloEixoY2: 'Combustível (kg)',
        minY1: 0,
        minY2: 0,
        maxY2: max_eixo2 * 1.5,
        tipoGrafico: "demonstrativo-2-eixo"
    });
}

function gerar_grafico_consumo_por_produto(planejamento, lista) {
    // Busca as informações de produtos
    const eixoX = [];
    const eixoY = [[], []];
    planejamento.dias.forEach(dia => {
        for(let i = 0; i < dia.produtos.length; i++) {
            let indc = eixoX.indexOf(dia.produtos[i]);
            if(indc == -1) {
                eixoX.push(dia.produtos[i]);
                eixoY[0].push(dia.consumo[i]);
                eixoY[1].push(dia.combustivel[i]);
            } else {
                eixoY[0][indc] += dia.consumo[i];
                eixoY[1][indc] += dia.combustivel[i];
            }
        }
    });

    // Busca o valor máximo de cada eixo y
    let max_eixo1 = 0;
    let max_eixo2 = 0;
    for(let i = 0; i < eixoY[0].length; i++) {
        if(eixoY[0][i] > max_eixo1) max_eixo1 = eixoX[0][i];
        if(eixoY[1][i] > max_eixo2) max_eixo2 = eixoY[1][i];
    }

    // Atualiza a lista de elementos a serem renderizados
    lista.push({
        tipo: 'paragrafo',
        cont: 'Relação entre o vapor consumido (eixo da esquerda) e o combustível gasto (eixo da direita), para cada produto cadastrado neste planejamento.'
    });
    lista.push({
        tipo: 'grafico',
        valoresX: eixoX,
        valoresY: eixoY,
        legendas: ['Vapor', 'Combustível'],
        tipoExibicao: ['line', 'line'],
        cores: ['rgb(225,123,44)', 'rgb(135,20,83)'],
        eixo: ['1', '2'],
        tituloEixoX: 'Produtos Cadastrados',
        tituloEixoY1: 'Vapor (kg)',
        tituloEixoY2: 'Combustível (kg)',
        minY1: 0,
        minY2: 0,
        maxY2: max_eixo2 * 1.5,
        tipoGrafico: "demonstrativo-2-eixo"
    });
}

/*function renderListaPlanejamentos() {
    // Busca os planejamentos cadastrados no objeto de controle de banco
    const producoes = gerente.getRef('producoes');

    // Remove os itens anteriores
    const listaPai = document.getElementById('listaProducoesView');
    const filhos = [];
    listaPai.childNodes.forEach(filho => filhos.push(filho));
    filhos.forEach(view => listaPai.removeChild(view));

    // Intera sobre os novos itens e adiciona na tela
    for(let i = producoes.length - 1; i >= 0; i--) {
        // Cria as divs principais
        const item = document.createElement('div');
        item.className = 'formulario';
        const info = document.createElement('div');
        info.className = 'form-item-6';
        const acao = document.createElement('div');
        acao.className = 'form-item-4 direita';

        // Implementa a ação de exclusão
        let excluir = () => {
            let posicao = i;
            gerente.del('producoes', posicao);
            renderListaPlanejamentos();
        };

        // Implementa a ação de visualização
        let visualizar = () => {
            let posicao = i;
            criarTela(posicao);
        };

        // Preenche o nome da produção
        const texto = document.createElement('span');
        texto.className = 'tag-input link-producao';
        texto.appendChild(document.createTextNode(`Nome: ${producoes[i].nome} --- Período: ${producoes[i].periodo}`));
        texto.addEventListener('click', visualizar);
        info.appendChild(texto);

        // Aciona os botões de ação
        const bt = document.createElement('button');
        bt.className = 'botao-comum';
        bt.appendChild(document.createTextNode('Excluir'));
        bt.addEventListener('click', excluir);
        acao.appendChild(bt);

        // Adiciona na lista principal
        item.appendChild(info);
        item.appendChild(acao);
        listaPai.appendChild(item);
    }
}*/
/*
function criarTela(posicao) {
    // Cria variáveis reutilizáveis
    let texto, par;
    const layout = new Layout();
    const grafico = new Grafico();

    // Recupera a produção cadastrada pela produção
    const producao = gerente.getRef('producoes')[posicao];

    // Abre uma nova janela
    const janela = window.open("", "", "width=900,height=500");
    janela.document.write(`<html><head><title>Detalhes de Planejamento</title></head>${criarEstilos()}<body><div id="conteudo"></div></body></html>`);

    // Encontra a div para alocação de informações
    const pagina = janela.document.getElementById('conteudo');

    // Adiciona o título
    const titulo = document.createElement('span');
    titulo.appendChild(document.createTextNode(producao.nome));
    pagina.appendChild(titulo);

    // Adiciona o período e informações gerais
    const periodo = document.createElement('p');
    periodo.appendChild(document.createTextNode(`Período: ${producao.periodo}`));
    periodo.appendChild(document.createElement('br'));
    periodo.appendChild(document.createTextNode(`Dias cadastrados: ${producao.dias.length}`));
    pagina.appendChild(periodo);

    // Adiciona as observações
    const observacoes = document.createElement('p');
    observacoes.appendChild(document.createTextNode(`Observações: ${producao.observacoes}`));
    pagina.appendChild(observacoes);

    // Cria a tabela para apresentar os dados dos dias detalhados
    const tituloTabela1 = document.createElement('span');
    tituloTabela1.appendChild(document.createTextNode('Tabela 1. Descrição dos dias do período'));
    const tb1 = criarTabelaDescricaoDias({ producao, layout });
    pagina.appendChild(tituloTabela1);
    pagina.appendChild(tb1);

    // Cria um texto de informativo para próxima tabela
    texto = 'Abaixo, verifique o consumo específico de vapor de cada produto produzido, em cada dia. O consumo específico se trata da quantidade de vapor gasta para produzir uma tonelada de determinado produto.';
    par = layout.criarParagrafo({
        texto,
        classe: 'm-sup'
    });
    pagina.appendChild(par);

    // Cria a tabela de consumo específico
    const tituloTabela2 = document.createElement('span');
    tituloTabela2.appendChild(document.createTextNode('Tabela 2. Consumo específico de vapor'));
    pagina.appendChild(tituloTabela2);
    const tb2 = criarTabelaConsumoEspecifico({ producao, layout });
    pagina.appendChild(tb2);

    // Aponta o consumo global
    let total = 0;
    for(let j = 0; j < producao.dias.length; j++) {
        for(let k = 0; k < producao.dias[j].consumo.length; k++) {
            total += producao.dias[j].consumo[k];
        }
    }
    texto = `Para a produção cadastrada como ${producao.nome}, o consumo geral de vapor, durante todo o processo, será de ${total.toString().replace('.', ',')} toneladas.`;
    par = layout.criarParagrafo({
        texto,
        classe: 'm-sup'
    });
    pagina.appendChild(par);

    // Discrimina o consumo por dia
    const tituloTabela3 = document.createElement('span');
    tituloTabela3.appendChild(document.createTextNode('Tabela 3. Consumo de vapor por dia'));
    pagina.appendChild(tituloTabela3);
    const tb3 = criarTabelaConsumoPorDia({ producao, layout });
    pagina.appendChild(tb3);

    // Faz o gráfico de quantidade de produto e quantidade de vapor
    texto = 'Para cada dia da produção, o gráfico abaixo relaciona a quantidade total de produtos produzida (no eixo esquerdo) e a quantidade de vapor gasto (no eixo direito).';
    par = layout.criarParagrafo({
        texto,
        classe: 'm-sup'
    });
    pagina.appendChild(par);
    let divGrafico = layout.criarDiv();
    divGrafico = layout.recriarDiv({
        div: divGrafico,
        width: '800px',
        height: '600px'
    });
    pagina.appendChild(divGrafico);
    const graf = criarGraficoProdutosConsumoVapor({ producao, divGrafico, grafico });

    // Descreve o consumo de combustível geral

    // Descreve o consumo de combustível por dia
}

function criarEstilos() {
    let css = '<style>';

    // Customiza a tabela
    css += 'table, th, td { border: 1px solid rgb(0,0,0); border-collapse: collapse; }';
    css += 'body { max-width: 800px; margin: 0 auto; }';
    css += 'th, td { padding: 5px; }';
    css += '.tabela { width: 100%; }';
    css += '.m-sup { margin-top: 30px; }';

    css += '</style>';
    return css;
}

function criarTabelaDescricaoDias({ producao, layout }) {
    const titulos = [
        layout.criarTexto({ texto: 'Dia' }),
        layout.criarTexto({ texto: 'Fatores de segurança' }),
        layout.criarTexto({ texto: 'Produtos' })
    ];
    // Cria a matriz com os elementos das colunas de preenchimento da tabela
    const conteudo = [];
    for(let i = 0; i < producao.dias.length; i++) {
        let coluna1 = layout.criarTexto({ texto: i + 1 });
        let coluna2 = layout.criarDiv();
        let coluna3 = layout.criarDiv();
        for(let j = 0; j < producao.dias[i].seguranca.length; j++) {
            coluna2 = layout.recriarDiv({
                div: coluna2,
                conteudo: layout.criarTexto({ texto: producao.dias[i].seguranca[j]})
            });
            if(j != producao.dias[i].seguranca.length - 1) {
                coluna2 = layout.recriarDiv({
                    div: coluna2,
                    conteudo: layout.criarQuebra()
                });
            }
        }
        for(let j = 0; j < producao.dias[i].produtos.length; j++) {
            coluna3 = layout.recriarDiv({
                div: coluna3,
                conteudo: layout.criarTexto({ texto: `${producao.dias[i].quantidades[j]} ton de ${producao.dias[i].produtos[j]}`})
            });
            if(j != producao.dias[i].produtos.length - 1) {
                coluna3 = layout.recriarDiv({
                    div: coluna3,
                    conteudo: layout.criarQuebra()
                });
            }
        }
        conteudo.push([coluna1, coluna2, coluna3]);
    }
    return layout.criarTabela({ titulos, conteudo, classe: 'tabela' });
}

function criarTabelaConsumoEspecifico({ producao, layout }) {
    const titulos = [
        layout.criarTexto({ texto: 'Dia' }),
        layout.criarTexto({ texto: 'Produtos' }),
        layout.criarTexto({ texto: 'Consumo específico (ton de vapor / ton de produto)' })
    ];
    // Cria a matriz com os elementos das colunas de preenchimento da tabela
    const conteudo = [];
    for(let i = 0; i < producao.dias.length; i++) {
        let coluna1 = layout.criarTexto({ texto: i + 1 });
        let coluna2 = layout.criarDiv();
        let coluna3 = layout.criarDiv();
        for(let j = 0; j < producao.dias[i].produtos.length; j++) {
            coluna2 = layout.recriarDiv({
                div: coluna2,
                conteudo: layout.criarTexto({ texto: producao.dias[i].produtos[j] })
            });
            if(j != producao.dias[i].produtos.length - 1) {
                coluna2 = layout.recriarDiv({
                    div: coluna2,
                    conteudo: layout.criarQuebra()
                });
            }
        }
        for(let j = 0; j < producao.dias[i].consumo.length; j++) {
            coluna3 = layout.recriarDiv({
                div: coluna3,
                conteudo: layout.criarTexto({ texto: (producao.dias[i].consumo[j] / producao.dias[i].quantidades[j]).toString().replace('.', ',') })
            });
            if(j != producao.dias[i].consumo.length - 1) {
                coluna3 = layout.recriarDiv({
                    div: coluna3,
                    conteudo: layout.criarQuebra()
                });
            }
        }
        conteudo.push([coluna1, coluna2, coluna3]);
    }
    return layout.criarTabela({ titulos, conteudo, classe: 'tabela' });
}

function criarTabelaConsumoPorDia({ producao, layout }) {
    const titulos = [
        layout.criarTexto({ texto: 'Dia' }),
        layout.criarTexto({ texto: 'Consumo de vapor (ton de Vapor / ton de Produto' }),
        layout.criarTexto({ texto: 'Consumo de combustível' })
    ];
    // Cria a matriz com os elementos das colunas de preenchimento da tabela
    const conteudo = [];
    for(let i = 0; i < producao.dias.length; i++) {
        let coluna1 = layout.criarTexto({ texto: i + 1 });
        let coluna2 = layout.criarDiv();
        let coluna3 = layout.criarTexto({ texto: 'Pirilampo' });
        let soma = 0;
        for(let j = 0; j < producao.dias[i].consumo.length; j++) {
            soma += producao.dias[i].consumo[j];
        }
        coluna2 = layout.recriarDiv({
            div: coluna2,
            conteudo: layout.criarTexto({ texto: soma.toString().replace('.', ',') })
        });
        conteudo.push([coluna1, coluna2, coluna3]);
    }
    return layout.criarTabela({ titulos, conteudo, classe: 'tabela' });
}

function criarGraficoProdutosConsumoVapor({ producao, divGrafico, grafico }) {
    const produtos = buscarProdutosProduzidos(producao);
    // Variáveis principais de configuração
    const valoresX = [];
    const valoresY = [];
    const legendas = [];
    const tipoExibicao = [];
    const cores = [];
    const eixo = [];
    const tituloEixoX = 'Relação de produção e consumo de vapor';
    const tituloEixoY1 = 'Quantidade produzida';
    const tituloEixoY2 = 'Consumo de vapor';
    const minY1 = 0;
    const maxY1 = 1.1 * maxProducao(producao);
    const minY2 = 0;
    const maxY2 = 1.2 * maxVapor(producao);
    const tipoGrafico = 'demonstrativo-2-eixo';

    // Inicializa matriz
    for(let i = 0; i < produtos.length; i++) {
        valoresY.push([]);
        tipoExibicao.push('line');
        legendas.push(produtos[i]);
        cores.push(Grafico.corAleatoria());
        eixo.push('1');
        for(let j = 0; j < producao.dias.length; j++) {
            valoresY[i].push(0);
        }
    }

    // Cria o espaço extra do consumo de vapor
    valoresY.push([]);
    legendas.push('Vapor');
    tipoExibicao.push('line');
    cores.push(Grafico.corAleatoria());
    eixo.push('2');

    // Percorre os dias cadastrados
    for(let i = 0; i < producao.dias.length; i++) {
        // Preenche o eixo X
        valoresX.push(`Dia ${i + 1}`);

        // Percorre os produtos cadastrados na produção do dia
        let vapor = 0;
        for(let j = 0; j < producao.dias[i].produtos.length; j++) {
            // Altera a produção diária de cada produto cadastrado
            for(let k = 0; k < legendas.length; k++) {
                if(producao.dias[i].produtos[j] == legendas[k]) {
                    valoresY[k][i] = producao.dias[i].quantidades[j];
                    break;
                }
            }

            // Calcula o gasto de vapor do dia
            vapor += producao.dias[i].consumo[j];
        }
        valoresY[valoresY.length - 1].push(vapor);
    }

    // Cria o gráfico
    grafico.setPai(divGrafico);
    const chart = grafico.criar({ tipoGrafico, cores, legendas, valoresX, valoresY, tituloEixoX, tipoExibicao, eixo, minY1, minY2, tituloEixoY1, tituloEixoY2 });
    return chart;
}

function maxProducao(producao) {
    let max = 0;
    for(let i = 0; i < producao.dias.length; i++) {
        for(let j = 0; j < producao.dias[i].quantidades.length; j++) {
            if(producao.dias[i].quantidades[j] > max) max = producao.dias[i].quantidades[j];
        }
    }
    return max;
}

function maxVapor(producao) {
    let max = 0;
    for(let i = 0; i < producao.dias.length; i++) {
        let soma = 0;
        for(let j = 0; j < producao.dias[i].consumo.length; j++) {
            soma += producao.dias[i].consumo[j];
        }
        if(soma > max) max = soma;
    }
    return max;
}

function buscarProdutosProduzidos(producao) {
    const produtos = [];
    for(let i = 0; i < producao.dias.length; i++) {
        for(let j = 0; j < producao.dias[i].produtos.length; j++) {
            let valido = true;
            for(let k = 0; k < produtos.length; k++) {
                if(produtos[k] == producao.dias[i].produtos[j]) valido = false;
            }
            if(valido) produtos.push(producao.dias[i].produtos[j]);
        }
    }
    return produtos;
}*/
