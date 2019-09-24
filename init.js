function entrar() {
    // Recolhimento de informações
    let user = document.getElementById('usuario').value;
    let pass = document.getElementById('senha').value;

    // Validação
    if(user == 'admin' && pass == 'admin') {
        alert('Login efetuado com sucesso, Vaporiza em funcionamento.');
        redirecionar();
    } else {
        alert('Usuário ou senha inválido, tente novamente.');
    }
}

function redirecionar() {
    window.location.href = './prog/index.html';
}
