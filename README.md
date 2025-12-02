# TEAR-Projeto

> O Projeto TEAR foi desenvolvido para a disciplina de Laboratório de Engenharia de Software do Departamento de Engenharia de Computação e Sistemas Digitais (PCS) da Escola Politécnica da Universidade de São Paulo (EPUSP).

## 📄 Sumário

- [Sobre o Projeto](#sobre-o-projeto)  
- [Pré-requisitos](#pré-requisitos)  
- [Instalação](#instalação)  
- [Como Executar](#como-executar)  

## Sobre o Projeto

Este repositório contém o código-fonte do projeto **TEAr**, desenvolvido para a disciplina de “Laboratório de Engenharia de Software”. O projeto possui, no mesmo repositório, as partes de **backend** e **frontend**. A ideia é facilitar a execução e desenvolvimento simultâneo tanto do servidor quanto da interface do usuário.

## Pré-requisitos

Antes de rodar o projeto, você vai precisar ter instalado no seu computador:

- Node.js (versão compatível) e npm (ou yarn)  
- (Opcional) Git, se quiser clonar o repositório  

## Instalação

1. Clone este repositório:
   ```bash
   git clone https://github.com/fefaortiz/tear-projeto.git
   cd tear-projeto

2. Instale as dependências para o backend:
   ```bash
   cd backend
   npm install

3. Instale as dependências para o frontend (a flag abaixo DEVE ser utilizada):
   ```bash
   cd ../frontend
   npm install --legacy-peer-deps

## Como Executar

1. Para executar o projeto, é necessário rodar o frontend:
   ```bash
   cd ./frontend
   npm run dev

2. E em um terminal separado o backend:
   ```bash
   cd ./backend
   npm run dev
