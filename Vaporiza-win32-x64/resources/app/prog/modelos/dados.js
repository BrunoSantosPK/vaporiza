/*const dadosPadrao = {
    nome: 'Vaporiza',
    pci: 50,
    ftChuva: 10,
    ftUmidade: 5,
    ftFrio: 15,
    tempAgua: 25,
    pressVapor: 200,
    eficiencia: 80
};

const dadosUsuario = {
    nome: 'Vaporiza',
    pci: 50,
    ftChuva: 10,
    ftUmidade: 5,
    ftFrio: 15,
    tempAgua: 25,
    pressVapor: 200,
    eficiencia: 80
};

// Consumo em kg de Vapor / kg de Matéria
const materiasPrimasCadastradas = [
    { nome: 'Lambari', unidade: 'unidades' },
    { nome: 'Madeira', unidade: 'toneladas' },
    { nome: 'Bosta', unidade: 'litros' }
];

// Quantidades em toneladas
const produtosCadastrados = [
    {
        nome: 'Peixe cozido',
        materias: ['Lambari', 'Bosta'],
        quantidades: [1.5, 0.05],
        consumo: 45
    },
    {
        nome: 'TI',
        materias: ['Bosta'],
        quantidades: [5],
        consumo: 777
    },
    {
        nome: 'Pato',
        materias: ['Lambari', 'Madeira', 'Bosta'],
        quantidades: [1, 1, 1],
        consumo: 666
    }
];

const producoesCadastradas = [
    {
        nome: 'Semana do peixe',
        periodo: '2019-02-15->2019-02-18',
        observacoes: 'Iremos produzir muito desvio de dinheiro e, ao final de tudo, todo mundo com dedo no cu, menos eu.',
        feriados: 0,
        dias: [
            {
                label: '15/02/2019',
                seguranca: ['chuva', 'umidade', 'frio'],
                produtos: ['Peixe cozido'],
                quantidades: [540],
                unidades: ['toneladas'],
                consumo: [14578],
                combustivel: [12]
            },
            {
                label: '16/02/2019',
                seguranca: ['chuva', 'frio'],
                produtos: ['Peixe cozido', 'TI'],
                unidades: ['toneladas', 'toneladas'],
                quantidades: [540, 666],
                consumo: [6499, 6479],
                combustivel: [78,98]
            },
            {
                label: '17/02/2019',
                seguranca: ['chuva'],
                produtos: ['TI'],
                unidades: ['toneladas'],
                quantidades: [1],
                consumo: [6666],
                combustivel: [45]
            },
            {
                label: '18/02/2019',
                seguranca: ['chuva', 'umidade'],
                produtos: ['Peixe cozido', 'Pato'],
                unidades: ['toneladas', 'toneladas'],
                quantidades: [666, 777],
                consumo: [4956, 4765],
                combustivel: [15, 46]
            }
        ]
    },
    {
        nome: 'Semana de bosta',
        periodo: '2019-01-18->2019-01-19',
        observacoes: 'Tomar no cu hoje, tomar no cu amanhã, tomar no cu sempre.',
        feriados: 0,
        dias: [
            {
                label: '18/01/2019',
                seguranca: ['chuva'],
                produtos: ['TI'],
                unidades: ['toneladas'],
                quantidades: [666],
                consumo: [776565],
                combustivel: [78]
            },
            {
                label: '19/01/2019',
                seguranca: ['chuva', 'frio'],
                produtos: ['Peixe cozido', 'TI'],
                unidades: ['toneladas', 'toneladas'],
                quantidades: [540, 666],
                consumo: [854787, 57979],
                combustivel: [48, 59]
            }
        ]
    }
];*/

// Inicializa a classe para manipulação do banco
const gerente = new Gerente();

// Faz a consulta aos arquivos externos
const file = require("fs");

// Diretório dos arquivos
const caminhoMaterias = __dirname + "/modelos/materias-prima.json";
const caminhoProdutos = __dirname + "/modelos/produtos.json";
const caminhoProducoes = __dirname + "/modelos/planejamentos.json";
const caminhoParametros = __dirname + "/modelos/parametros.json";

// Popula as matérias-prima
const leituraMaterias = file.readFileSync(caminhoMaterias);
gerente.setRef('materias', JSON.parse(leituraMaterias));

// Popula os produtos
const leituraProdutos = file.readFileSync(caminhoProdutos);
gerente.setRef('produtos', JSON.parse(leituraProdutos));

// Popula as produções
const leituraProducoes = file.readFileSync(caminhoProducoes);
gerente.setRef('producoes', JSON.parse(leituraProducoes));

// Preenche os parâmetros de usuário
const leituraParametros = file.readFileSync(caminhoProducoes);
