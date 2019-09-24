/*const conteudo = {
    titulo: "Vaporiza",
    elementos: [{
        tipo: "titulo",
        cont: "QUERO MUDAR O MUNDO"
    },{
        tipo: "paragrafo",
        cont: "Minha vida é uma grande tristeza, mal sei o que farei depois de um dia, muito menos o que farei daqui a um ano. Sabe, as vezes eu penso que tudo poderia ser esquecido, que tudo poderia desaparecer e assim, quem sabe, eu me tornaria alguém melhor. Quem sabe assim a minha existência deixasse de ser um peso morto para o mundo. Será? Seria tão bom, mas pelo visto minha sina é sobreviver no meio desse mundo sombrio e decadente."
    }, {
        tipo: "tabela",
        titulo: "Tipos de livros por países",
        legenda: true,
        rotulos: ["", "Ficção Científica", "Ação", "Aventura", "Romance"],
        linhas: [["Brasil", 10, 25, 10, 50], ["Argentina", 6, 6, 6, 6], ["Paraguai", 5, 19, 0, 95]]
    }, {
        tipo: "paragrafo",
        cont: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam rhoncus, nibh ac tincidunt consequat, orci lectus blandit est, et feugiat velit libero id nulla. Fusce sollicitudin justo a viverra dignissim. Suspendisse id metus eget purus lobortis condimentum. Curabitur tempus metus sed justo auctor, pharetra laoreet odio tincidunt. Quisque sed lorem id velit posuere consequat. Vivamus eros nisl, auctor eu porta nec, scelerisque et quam. Nunc et commodo orci. Vivamus eu eros eget nisi varius rutrum ac in nulla. Ut a eleifend tortor, vel auctor urna. Nullam et cursus lectus. Integer varius diam massa, eu mattis ex feugiat sed. Curabitur a velit aliquam, fringilla ipsum sed, hendrerit est. Cras felis nulla, tempus sed tellus sit amet, scelerisque commodo velit. Sed pharetra vel ipsum eu finibus."
    }, {
        tipo: "titulo",
        cont: "VIVER DA MELHOR FORMA"
    }, {
        tipo: "grafico",
        valoresX: ["04/05/2019", "05/05/2019", "06/05/2019", "07/05/2019"],
        valoresY: [[10, 5, 0, 15], [66, 55, 6, 77], [0, 46, 0, 26], [100, 95, 23, 166]],
        legendas: ["Alcatrão", "Conhaque", "Pistola", "Vapor"],
        tipoExibicao: ["line", "line", "line", "line"],
        cores: [Grafico.corAleatoria(), Grafico.corAleatoria(), Grafico.corAleatoria(), Grafico.corAleatoria()],
        eixo: ["1", "1", "1", "2"],
        tituloEixoX: "Relação de produção e consumo de vapor",
        tituloEixoY1: "Quantidade produzida",
        tituloEixoY2: "Consumo de vapor",
        minY1: 0,
        minY2: 0,
        tipoGrafico: "demonstrativo-2-eixo"
    }, {
        tipo: "paragrafo",
        cont: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam rhoncus, nibh ac tincidunt consequat, orci lectus blandit est, et feugiat velit libero id nulla. Fusce sollicitudin justo a viverra dignissim. Suspendisse id metus eget purus lobortis condimentum. Curabitur tempus metus sed justo auctor, pharetra laoreet odio tincidunt. Quisque sed lorem id velit posuere consequat. Vivamus eros nisl, auctor eu porta nec, scelerisque et quam. Nunc et commodo orci. Vivamus eu eros eget nisi varius rutrum ac in nulla. Ut a eleifend tortor, vel auctor urna. Nullam et cursus lectus. Integer varius diam massa, eu mattis ex feugiat sed. Curabitur a velit aliquam, fringilla ipsum sed, hendrerit est. Cras felis nulla, tempus sed tellus sit amet, scelerisque commodo velit. Sed pharetra vel ipsum eu finibus."
    }]
};*/

init();

function carregar() {
    // Recupera os dados do storage
    const json_dados = JSON.parse(localStorage.getItem("dados"));
    return json_dados;
}

function init() {
    // Recupera o conteúdo da página
    const conteudo = carregar();
    const layout = new Layout();
    const grafico = new Grafico();

    // Configura o cabeçalho
    document.getElementById("tituloCabecalho").innerHTML = conteudo.titulo;
    document.getElementsByTagName("title")[0].text = conteudo.titulo;

    // Preenche o conteúdo da página
    const pagina = document.getElementById("conteudo");
    let numTab = 1;
    for(let i = 0; i < conteudo.elementos.length; i++) {
        if(conteudo.elementos[i].tipo == "titulo") {
            let titulo = layout.criarParagrafo({ texto: conteudo.elementos[i].cont, classe: 'titulo-geral' });
            pagina.appendChild(titulo);
        }
        if(conteudo.elementos[i].tipo == "subtitulo") {
            let subtitulo = layout.criarParagrafo({ texto: conteudo.elementos[i].cont, classe: 'subtitulo-geral' });
            pagina.appendChild(subtitulo);
        }
        if(conteudo.elementos[i].tipo == "paragrafo") {
            let paragrafo = layout.criarParagrafo({ texto: conteudo.elementos[i].cont, classe: 'texto-geral' });
            pagina.appendChild(paragrafo);
        }
        if(conteudo.elementos[i].tipo == 'tabela') {
            // Cria o título da tabela
            if(conteudo.elementos[i].legenda) {
                let texto = `Tabela ${numTab}. ${conteudo.elementos[i].titulo}.`;
                let classe = 'titulo-tabela';
                let titulo = layout.criarSpan({ texto, classe });
                numTab++;
                pagina.appendChild(titulo);
            }

            // Cria a tabela
            let tabela = layout.criarTabela({
                titulos: layout.criarTextoLista({ lista: conteudo.elementos[i].rotulos }),
                conteudo: layout.criarTextoLista({ lista: conteudo.elementos[i].linhas, matriz: true }),
                classe: 'tabela',
                classeHeader: 'celula-titulo',
                classeCelula: 'celula-comum'
            });
            pagina.appendChild(tabela);
        }
        if(conteudo.elementos[i].tipo == "grafico") {
            // Cria o espaço de alocação do gráfico
            let divGrafico = layout.criarDiv();
            divGrafico = layout.recriarDiv({
                div: divGrafico,
                width: '100%',
                height: '500px',
                classe: "div-grafico"
            });
            pagina.appendChild(divGrafico);

            // Configura o gráfico via chart.js
            grafico.setPai(divGrafico);
            grafico.criar({
                tipoGrafico: conteudo.elementos[i].tipoGrafico,
                cores: conteudo.elementos[i].cores,
                legendas: conteudo.elementos[i].legendas,
                valoresX: conteudo.elementos[i].valoresX,
                valoresY: conteudo.elementos[i].valoresY,
                tituloEixoX: conteudo.elementos[i].tituloEixoX,
                tipoExibicao: conteudo.elementos[i].tipoExibicao,
                eixo: conteudo.elementos[i].eixo,
                minY1: conteudo.elementos[i].minY1,
                minY2: conteudo.elementos[i].minY2,
                maxY1: conteudo.elementos[i].maxY1,
                maxY2: conteudo.elementos[i].maxY2,
                tituloEixoY1: conteudo.elementos[i].tituloEixoY1,
                tituloEixoY2: conteudo.elementos[i].tituloEixoY2
            });
        }
    }
}
