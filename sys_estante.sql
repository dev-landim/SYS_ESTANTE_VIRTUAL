create database if not exists sys_estante
default character set utf8mb4
default collate utf8mb4_unicode_ci;

use sys_estante;

create table if not exists usuarios (
	id int not null auto_increment primary key,
    nome varchar(100) not null,
    email varchar(100) not null unique,
    senha varchar(255) not null,
    tipo enum('cliente', 'administrador') not null default 'cliente'
)default charset = utf8mb4;

select * from usuarios;

update usuarios set tipo = 'administrador' where id = 1;

truncate usuarios;

create table if not exists exemplares (
	isbn varchar(13) not null primary key unique,
	titulo varchar(100) not null,
    autor varchar (100) not null,
    editora varchar (100) not null,
    data_publicacao date not null
) default char set utf8mb4; 

drop table exemplares;

INSERT INTO exemplares (isbn, titulo, autor, editora, data_publicacao)
VALUES
('139788582852477', 'Memórias do subsolo', ' Fiódor Dostoiévski', 'Penguin-Companhia', '01-12-2021'),
('9788582850749', 'Noites brancas', 'Fiódor Dostoiévski', 'Penguin-Companhia', '31-08-2018'),
('9788594318787', 'A Metamorfose', 'Franz Kafka', 'Principis', '27-09-2019'),
('9786555320350', 'A hora da estrela', 'Clarice Lispector', 'Rocco', '16-11-2020'),
('9788573263596', 'A morte de Ivan Ilitch', 'Lev Tolstói ', 'Editora 34', '01-01-2009'),
('9788563560438', 'O retrato de Dorian Gray', 'Oscar Wilde', 'Penguin-Companhia', '12-04-2012'),
(' 9788582850138', 'O médico e o monstro', 'Robert Louis Stevenson', 'Penguin-Companhia', '04-03-2015');

select * from exemplares;

    
