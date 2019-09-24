class Grafico {

    constructor() {
        this.idCanvas = '';
        this.divPai = undefined;
    }

    setPai(div) {
        this.divPai = div;
    }

    static corAleatoria() {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r},${g},${b})`;
    }

    criar({ tipoGrafico, cores, legendas, linhas, pontos, valoresX, valoresY, minX, minY, maxX, maxY, tituloEixoX, tituloEixoY, tipoExibicao, eixo, minY1, maxY1, minY2, maxY2, tituloEixoY1, tituloEixoY2 }) {
        const done = () => {};
        const configChart = {
            data: {
                datasets: undefined
            },
            options: {
                scales: undefined,
                bezierCurve : false,
                animation: {
                    onComplete: done
                }
            }
        };
        const canvas = this.criarCanvas();
        let dados, escala;
        if(tipoGrafico == 'escala-1-eixo') {
            dados = this.configurarDatasetEscala({ cores, legendas, linhas, pontos, valoresX, valoresY });
            escala = this.configurarEscala({ minX, minY, maxX, maxY, tituloEixoX, tituloEixoY });
            configChart.type = 'scatter';
        } else if(tipoGrafico == 'demonstrativo-1-eixo') {
            dados = this.configurarDatasetDemonstrativo({ cores, legendas, valoresY, tipoExibicao });
            escala = this.configurarGraficoDemonstrativo({ minY, maxY, tituloEixoX, tituloEixoY });
            configChart.type = 'bar';
            configChart.data.labels = valoresX;
        } else if(tipoGrafico == 'demonstrativo-2-eixo') {
            dados = this.configurarDatasetDemonstrativoDuploEixo({ cores, legendas, valoresY, tipoExibicao, eixo });
            escala = this.configurarGraficoDemonstrativoDuploEixo({ minY1, maxY1, minY2, maxY2, tituloEixoX, tituloEixoY1, tituloEixoY2 });
            configChart.type = 'bar';
            configChart.data.labels = valoresX;
        }
        
        configChart.data.datasets = dados;
        configChart.options.scales = escala
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, configChart);
        return chart;
    }

    configurarDataPontos(valoresX, valoresY) {
        const data = [];
        for(let i = 0; i < valoresX.length; i++) {
            data.push({ x: valoresX[i], y: valoresY[i] });
        }
        return data;
    }

    configurarDatasetEscala({ cores, legendas, linhas, pontos, valoresX, valoresY }) {
        const dataset = [];
        for(let i = 0; i < cores.length; i++) {
            let data = this.configurarDataPontos(valoresX[i], valoresY[i]);
            let config = {
                label: legendas[i],
                fill: false,
                backgroundColor: cores[i],
                showLine: linhas[i],
                data
            };
            if(!pontos[i]) config.pointRadius = 0;
            dataset.push(config);
        }
        return dataset;
    }

    configurarDatasetEscalaDuploEixo({ cores, legendas, linhas, pontos, valoresX, valoresY, eixo }) {
        const dataset = [];
        const idGrafico = this.idCanvas;
        for(let i = 0; i < cores.length; i++) {
            let data = this.configurarDataPontos(valoresX[i], valoresY[i]);
            let config = {
                label: legendas[i],
                fill: false,
                backgroundColor: cores[i],
                showLine: linhas[i],
                data,
                yAxisID: `${idGrafico}-eixo-${eixo[i]}`
            };
            if(!pontos[i]) config.pointRadius = 0;
            dataset.push(config);
        }
        return dataset;
    }

    configurarEscala({ minX, minY, maxX, maxY, tituloEixoX, tituloEixoY }) {
        const escala = {
            xAxes: [{
                scaleLabel: {
                    display: true,
                    position: 'bottom',
                    labelString: tituloEixoX
                },
                ticks: {}
            }],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: tituloEixoY
                },
                ticks: {}
            }]
        };
        if(minX != undefined) escala.xAxes[0].ticks.min = minX;
        if(maxX != undefined) escala.xAxes[0].ticks.max = maxX;
        if(minY != undefined) escala.yAxes[0].ticks.min = minY;
        if(maxY != undefined) escala.yAxes[0].ticks.max = maxY;
        return escala;
    }

    configurarEscalaDuploEixo({ minX, minY1, minY2, maxX, maxY1, maxY2, tituloEixoX, tituloEixoY1, tituloEixoY2 }) {
        const idGrafico = this.idCanvas;
        const escala = {
            xAxes: [{
                scaleLabel: {
                    display: true,
                    position: 'bottom',
                    labelString: tituloEixoX
                },
                ticks: {}
            }],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: tituloEixoY1
                },
                ticks: {},
                id: `${idGrafico}-eixo-1`,
                position: 'left'
            }, {
                scaleLabel: {
                    display: true,
                    labelString: tituloEixoY2
                },
                ticks: {},
                id: `${idGrafico}-eixo-1`,
                position: 'right',
                gridLines: {
                    drawOnChartArea: false,
                }
            }]
        };
        if(minX != undefined) escala.xAxes[0].ticks.min = minX;
        if(maxX != undefined) escala.xAxes[0].ticks.max = maxX;
        if(minY1 != undefined) escala.yAxes[0].ticks.min = minY1;
        if(maxY1 != undefined) escala.yAxes[0].ticks.max = maxY1;
        if(minY2 != undefined) escala.yAxes[1].ticks.min = minY2;
        if(maxY2 != undefined) escala.yAxes[1].ticks.max = maxY2;
        return escala;
    }

    configurarDatasetDemonstrativo({ cores, legendas, valoresY, tipoExibicao }) {
        const dataset = [];
        for(let i = 0; i < cores.length; i++) {
            dataset.push({
                label: legendas[i],
                type: tipoExibicao[i],
                fill: false,
                backgroundColor: cores[i],
                data: valoresY[i].slice()
            });
        }
        return dataset;
    }

    configurarGraficoDemonstrativo({ minY, maxY, tituloEixoX, tituloEixoY }) {
        const escala = {
            xAxes: [{
                scaleLabel: {
                    display: true,
                    position: 'bottom',
                    labelString: tituloEixoX
                }
            }],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: tituloEixoY
                },
                ticks: {}
            }]
        };
        if(minY != undefined) escala.yAxes[0].ticks.min = minY;
        if(maxY != undefined) escala.yAxes[0].ticks.max = maxY;
        return escala;
    }

    configurarDatasetDemonstrativoDuploEixo({ cores, legendas, valoresY, tipoExibicao, eixo }) {
        const dataset = [];
        const idGrafico = this.idCanvas;
        for(let i = 0; i < cores.length; i++) {
            dataset.push({
                label: legendas[i],
                type: tipoExibicao[i],
                fill: false,
                backgroundColor: cores[i],
                data: valoresY[i].slice(),
                yAxisID: `${idGrafico}-eixo-${eixo[i]}`
            });
        }
        return dataset;
    }

    configurarGraficoDemonstrativoDuploEixo({ minY1, maxY1, minY2, maxY2, tituloEixoX, tituloEixoY1, tituloEixoY2 }) {
        const idGrafico = this.idCanvas;
        const escala = {
            xAxes: [{
                scaleLabel: {
                    display: true,
                    position: 'bottom',
                    labelString: tituloEixoX
                }
            }],
            yAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: tituloEixoY1
                },
                ticks: {},
                id: `${idGrafico}-eixo-1`,
                position: 'left'
            }, {
                scaleLabel: {
                    display: true,
                    labelString: tituloEixoY2
                },
                ticks: {},
                id: `${idGrafico}-eixo-2`,
                position: 'right',
                gridLines: {
                    drawOnChartArea: false,
                }
            }]
        };
        if(minY1 != undefined) escala.yAxes[0].ticks.min = minY1;
        if(maxY1 != undefined) escala.yAxes[0].ticks.max = maxY1;
        if(minY2 != undefined) escala.yAxes[1].ticks.min = minY2;
        if(maxY2 != undefined) escala.yAxes[1].ticks.max = maxY2;
        return escala;
    }

    criarCanvas() {
        this.idCanvas = this.gerarID(10);
        const canvas = document.createElement('canvas');
        canvas.id = this.idCanvas;
        this.divPai.appendChild(canvas);
        return canvas;
    }

    gerarID(tamanho) {
        const caracteres = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
        let id = '';
        for(let i = 0; i < tamanho; i++) {
            let indc = Math.floor(Math.random() * caracteres.length);
            id += caracteres[indc];
        }
        return id;
    }

}