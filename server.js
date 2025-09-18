const express = require('express');
const session = require('express-session')
const path = require('path');
const mysql = require('mysql2')
const bcrypt = require('bcrypt')

const server = express();
const port = 3000;

//Fazendo conexão com o banco de dados Mysql
const conexaoBanco = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'sys_estante'
}).promise()


server.use(express.static(path.join(__dirname, 'public')));
server.use(express.json())
server.use(express.urlencoded({ extended: true }));

server.use(session({
    secret: 'senha123', // Chave secreta para assinar o cookie da sessão
    resave: false, // Não salvar a sessão se não for modificada
    saveUninitialized: false, // Não criar sessão até que algo seja armazenado
    cookie: {
        secure: false, // Em produção, use 'true' com HTTPS
        httpOnly: true, // Impede acesso ao cookie via JavaScript no cliente
        maxAge: 3600000 // Tempo de vida do cookie em milissegundos (1 hora)
    }
}));


const checkUserLogado = (req, res, next) => {
    //Se a sessao do usuário não existir, ele não pode estar logado
    if (!req.session.user) {
        return res.redirect('/login.html')
    } else {
        //Se o usuário estiver logado, permite que a requisição continua.
        next()
    }
}

// Rota principal (página inicial) - PROTEGIDA
// Apenas usuários logados podem acessar.
server.get('/', checkUserLogado, (req, res) => {
    // A função checkAuthenticated garante que só chegaremos aqui se o usuário estiver logado.
    // Usamos sendFile para enviar o arquivo index.html.
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para obter dados do usuário logado (usado pelo frontend)
server.get('/api/user', checkUserLogado, (req, res) => {
    // Retorna os dados do usuário armazenados na sessão em formato JSON.
    res.json({
        nome: req.session.user.nome,
        tipo: req.session.user.tipo
    });
});

// Rota de Cadastro (POST)
server.post('/cadastrar', async(req, res) => {
    const { nome, email, senha, tipo } = req.body;

    console.log('Dados recebidos para cadastro:', { nome, email, tipo });

    try {
        // ETAPA 4: CRIPTOGRAFIA DA SENHA
        // Gerar um "salt" e depois o hash da senha.
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        // ETAPA 5: INSERÇÃO SEGURA NO BANCO DE DADOS
        // Verificar se o email já existe
        const [rows] = await conexaoBanco.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length > 0) {
            // Se o email já existe, podemos retornar uma mensagem de erro.
            // Por simplicidade, vamos apenas redirecionar para o cadastro com uma mensagem (ideal seria um alerta).
            return res.redirect('/cadastro.html?error=email_existente');
        }

        // Inserir o novo usuário no banco de dados com a senha criptografada.
        // O uso de '?' evita SQL Injection.

        // Note que 'tipo' vem do formulário e pode ser 'cliente' ou 'administrador'.
        const sql = 'INSERT INTO usuarios (nome, email, senha, tipo) VALUES (?, ?, ?, ?)'
        const values = [nome, email, senhaHash, tipo]

        conexaoBanco.query(sql, values, (err, results) => {
            if (err) {
                console.error('Erro ao inserir usuário no banco:', err);
                return res.status(500).send('Erro no servidor ao tentar cadastrar.');
            }
            return res.status(201).send('Usuário cadastrado com sucesso!');

        });
        // Redireciona para a página de login após o cadastro.
        res.redirect('/login.html');


    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).send('Erro no servidor ao tentar cadastrar.');
    }
});


// Rota de Login (POST)
server.post('/login', async(req, res) => {
    const { email, senha } = req.body;

    try {
        // 1. Buscar o usuário pelo email no banco de dados.
        const [rows] = await conexaoBanco.query('SELECT * FROM usuarios WHERE email = ?', [email]);

        // 2. Verificar se o usuário foi encontrado.
        if (rows.length === 0) {
            console.log('Tentativa de login com email não cadastrado:', email);
            // Redireciona de volta para o login se o email não for encontrado.
            return res.redirect('/login.html?error=not_found');
        }

        const usuario = rows[0];

        // 3. Comparar a senha fornecida com o hash armazenado no banco.
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (senhaCorreta) {
            // 4. Se a senha estiver correta, criar a sessão do usuário.
            req.session.user = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                tipo: usuario.tipo // 'usuario' ou 'administrador'
            };

            console.log('Login bem-sucedido para:', usuario.email);
            // Redirecionar para a página principal.
            res.redirect('/');
        } else {
            // 5. Se a senha estiver incorreta.
            console.log('Senha incorreta para o email:', email);
            res.redirect('/login.html?error=wrong_password');
        }

    } catch (error) {
        console.error('Erro no processo de login:', error);
        res.status(500).send('Erro no servidor durante o login.');
    }
});

// Rota de Logout (GET)
server.get('/logout', (req, res) => {
    // ETAPA 6: DESTRUINDO A SESSÃO
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao fazer logout:', err);
            return res.status(500).send('Não foi possível fazer logout.');
        }
        // Limpa o cookie do cliente e redireciona para a página de login.
        res.clearCookie('connect.sid'); // 'connect.sid' é o nome padrão do cookie de sessão do express-session
        res.redirect('/login.html');
    });
});


/*
    ETAPA FINAL: INICIAR O SERVIDOR
*/
server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

// Rota para buscar exemplares no banco de dados
server.get('/api/exemplares', checkUserLogado, async(req, res) => {
    try {
        const [rows] = await conexaoBanco.query('SELECT * FROM exemplares');
        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar exemplares:', error);
        res.status(500).json({ erro: 'Erro ao buscar exemplares' });
    }
});