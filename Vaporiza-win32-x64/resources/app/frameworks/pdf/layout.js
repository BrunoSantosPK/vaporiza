class Layout {

    constructor() {
        this.style = '';
    }

    criarBotao({ rotulo, evento, classe }) {
        const botao = document.createElement('button');
        botao.appendChild(rotulo);
        if(evento != undefined) botao.addEventListener('click', evento);
        if(classe != undefined) botao.className = classe;
    }

    criarTexto({ texto }) {
        return document.createTextNode(texto);
    }

    criarTextoLista({ lista, matriz }) {
        let resultado = [];
        if(matriz == true) {}
        lista.forEach(elemento => {
            if(matriz == true) {
                let colunas = [];
                elemento.forEach(frase => {
                    let div = this.criarDiv();
                    frase = frase.split('<br>');
                    frase.forEach((texto, i) => {
                        div.appendChild(document.createTextNode(texto));
                        if(i != frase.length - 1) div.appendChild(this.criarQuebra());
                    });
                    colunas.push(div)
                });
                resultado.push(colunas);
            } else {
                elemento = elemento.split('<br>');
                let div = this.criarDiv();
                elemento.forEach((texto, i) => {
                    div.appendChild(document.createTextNode(texto));
                    if(i != elemento.length - 1) div.appendChild(this.criarQuebra());
                });
                resultado.push(div);
            }
        });
        return resultado;
    }

    criarParagrafo({ texto, classe }) {
        const paragrafo = document.createElement('p');
        if(classe != undefined) paragrafo.className = classe;
        paragrafo.appendChild(document.createTextNode(texto));
        return paragrafo;
    }

    criarSpan({ texto, classe }) {
        const span = document.createElement('span');
        if(classe != undefined) span.className = classe;
        span.appendChild(document.createTextNode(texto));
        return span;
    }

    criarDiv() {
        return document.createElement('div');
    }

    criarQuebra() {
        return document.createElement('br');
    }

    recriarDiv({ div, conteudo, id, width, height, classe }) {
        if(classe != undefined) div.className = classe;
        if(conteudo != undefined) div.appendChild(conteudo);
        if(id != undefined) div.id = id;
        if(width != undefined) div.style.width = width;
        if(height != undefined) div.style.height = height;
        return div;
    }

    criarImagem({ src, classe }) {
        const img = document.createElement('img');
        img.src = src;
        if(classe != undefined) img.className = classe;
        return img;
    }

    criarTabela({ titulos, conteudo, classe, classeHeader, classeCelula }) {
        // Cria a tabela e o título
        const tabela = document.createElement('table');
        if(classe != undefined) tabela.className = classe;
        let linha = document.createElement('tr');
        for(let i = 0; i < titulos.length; i++) {
            let col = document.createElement('th');
            if(classeHeader != undefined) col.className = classeHeader;
            col.appendChild(titulos[i]);
            linha.appendChild(col);
        }
        tabela.appendChild(linha);

        // Preenche o conteúdo da tabela
        for(let i = 0; i < conteudo.length; i++) {
            linha = document.createElement('tr');
            for(let j = 0; j < conteudo[i].length; j++) {
                let col = document.createElement('td');
                if(classeCelula != undefined) col.className = classeCelula;
                col.appendChild(conteudo[i][j]);
                linha.appendChild(col);
            }
            tabela.appendChild(linha);
        }

        return tabela;
    }

    excluirFilhos({ idDiv }) {
        const div = document.getElementById(idDiv);
        let filhos = [];
        div.childNodes.forEach(elemento => filhos.push(elemento));
        filhos.forEach(item => div.removeChild(item));
        return div;
    }

}
