function validaNumero(num) {
    let valido = true;
    let erro = [];
    if(isNaN(num)) {
        valido = false;
        erro.push('Valor NaN.');
    }
    if(typeof(num) != "number") {
        valido = false;
        erro.push('Tipo diferente de Number.');
    } else {
        num = num.toString();
        for(let i = 0; i < num.length; i++) {
            if(num[i] != '0' && num[i] != '1' && num[i] != '2' && num[i] != '3' && num[i] != '4' && num[i] != '5' && num[i] != '6' && num[i] != '7' && num[i] != '8' && num[i] != '9' && num[i] != '.') {
                valido = false;
                erro.push(`Caracter ${num[i]} não numérico.`)
            }
        }
    }
    return valido;
}

function validaPalavra(pal, max, log = false) {
    let valido = true;
    let erro = [];
    if(typeof(pal) != "string") {
        valido = false;
        erro.push('Tipo diferente de String.');
    } else {
        if(pal.length > max) {
            valido = false;
            erro.push('Quantidade de caracteres ultrapassada.');
        }
        if(pal == '') {
            valido = false;
            erro.push('Caracter vazio.');
        }
    }
    if(!log) {
        return valido;
    } else {
        return { valido, erro };
    }
}