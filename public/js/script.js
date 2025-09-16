// Este script é executado na página principal (index.html) após o login.
document.addEventListener('DOMContentLoaded', () => {
    // Busca os dados do usuário na nossa API.
    fetch('/api/user')
        .then(response => {
            // Se a resposta não for 'ok' (ex: status 401 Unauthorized),
            // significa que a sessão expirou ou é inválida. Redireciona para o login.
            if (!response.ok) {
                window.location.href = '/login.html';
                return;
            }
            return response.json();
        })
        .then(data => {
            // Se os dados foram recebidos com sucesso...
            if (data) {
                // Atualiza o nome do usuário na página.
                const userNameSpan = document.getElementById('userName');
                // Deixa só a primeira letra maiúscula
                const nomeFormatado = data.nome.charAt(0).toUpperCase() + data.nome.slice(1);
                userNameSpan.textContent = nomeFormatado;


                // Verifica se o usuário é um administrador.
                if (data.tipo === 'administrador') {
                    // Se for, exibe o painel de administrador.
                    const adminContentDiv = document.getElementById('adminContent');
                    adminContentDiv.style.display = 'block';
                }
            }
        })
        .catch(error => {
            console.error('Erro ao buscar dados do usuário:', error);
            // Em caso de erro na requisição, também redireciona para o login.
            window.location.href = '/login.html';
        });
});