class Gerente {

    constructor(diretorio = __dirname) {
        this.bdProdutos = [];
        this.bdMaterias = [];
        this.bdProducoes = [];
        this.dados = {};
        this.dadosPadrao = {
            nome: 'Vaporiza',
            responsavel: 'Bruno Santos',
            combustivel: 'Eucalipto',
            densidade: 537,
            pci: 9623.2,
            ftChuva: 10,
            ftUmidade: 5,
            ftFrio: 15,
            tempAgua: 40,
            pressVapor: 490.332,
            eficiencia: 80
        };

        this.file = require("fs");
        this.diretorio = diretorio;
        this.dirParametros = diretorio + "/modelos/parametros.json";
        this.dirProdutos = diretorio + "/modelos/produtos.json";
        this.dirMaterias = diretorio + "/modelos/materias-prima.json";
        this.dirProducoes = diretorio + "/modelos/planejamentos.json";
        this.inicializar();
    }

    inicializar() {
        const leituraParametros = this.file.readFileSync(this.dirParametros);
        const par = JSON.parse(leituraParametros);
        this.setParametros(par);
    }

    setRef(id, ref) {
        if(id == 'produtos') {
            this.bdProdutos = ref.slice();
        } else if(id == 'materias') {
            this.bdMaterias = ref.slice();
        } else if(id == 'producoes') {
            this.bdProducoes = ref.slice();
        } else {
            throw console.error('Identificador de banco não cadastrado.');
        }
    }

    setParametros(json) {
        const { nome, pci, ftChuva, ftUmidade, ftFrio, tempAgua, pressVapor, eficiencia, responsavel, combustivel, densidade } = json;
        this.dados = { nome, pci, ftChuva, ftUmidade, ftFrio, tempAgua, pressVapor, eficiencia, responsavel, combustivel, densidade };
        this.file.writeFileSync(this.dirParametros, JSON.stringify(this.dados));
    }

    initParametros() {
        const { nome, pci, ftChuva, ftUmidade, ftFrio, tempAgua, pressVapor, eficiencia, responsavel, combustivel, densidade } = this.dadosPadrao;
        this.dados = { nome, pci, ftChuva, ftUmidade, ftFrio, tempAgua, pressVapor, eficiencia, responsavel, combustivel, densidade };
        this.file.writeFileSync(this.dirParametros, JSON.stringify(this.dados));
    }

    getRef(id) {
        if(id == 'produtos') {
            return this.bdProdutos;
        } else if(id == 'materias') {
            return this.bdMaterias;
        } else if(id == 'producoes') {
            return this.bdProducoes;
        } else {
            throw console.error('Identificador de banco não cadastrado.');
        }
    }

    getDadosMateria(nome) {
        let ref;
        this.bdMaterias.forEach(materia => {
            if(materia.nome == nome) ref = materia;
        });
        return ref;
    }

    getDadosProduto(nome) {
        let ref;
        this.bdProdutos.forEach(produto => {
            if(produto.nome == nome) ref = produto;
        });
        return ref;
    }

    getParametros() {
        return this.dados;
    }

    add(id, novo) {
        if(id == 'produtos') {
            this.bdProdutos.push(novo);
            this.file.writeFileSync(this.dirProdutos, JSON.stringify(this.bdProdutos));
            return this;
        } else if(id == 'materias') {
            this.bdMaterias.push(novo);
            this.file.writeFileSync(this.dirMaterias, JSON.stringify(this.bdMaterias));
            return this;
        } else if(id == 'producoes') {
            this.bdProducoes.push(novo);
            this.file.writeFileSync(this.dirProducoes, JSON.stringify(this.bdProducoes));
            return this;
        } else {
            throw console.error('Identificador de banco não cadastrado.');
        }
    }

    del(id, posicao) {
        if(id == 'produtos') {
            this.bdProdutos.splice(posicao, 1);
            this.file.writeFileSync(this.dirProdutos, JSON.stringify(this.bdProdutos));
            return this;
        } else if(id == 'materias') {
            this.bdMaterias.splice(posicao, 1);
            this.file.writeFileSync(this.dirMaterias, JSON.stringify(this.bdMaterias));
            return this;
        } else if(id == 'producoes') {
            this.bdProducoes.splice(posicao, 1);
            this.file.writeFileSync(this.dirProducoes, JSON.stringify(this.bdProducoes));
            return this;
        } else {
            throw console.error('Identificador de banco não cadastrado.');
        }
    }

}
