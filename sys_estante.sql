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