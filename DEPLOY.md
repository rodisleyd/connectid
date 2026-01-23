# Guia de Deploy (Vercel)

A Vercel é perfeita para projetos React/Vite. Você tem duas opções:

## Opção 1: Via Linha de Comando (Mais rápido para testar)

1.  Instale a Vercel CLI globalmente (apenas uma vez):
    ```bash
    npm i -g vercel
    ```

2.  Faça o login:
    ```bash
    vercel login
    ```

3.  Na pasta do projeto, rode:
    ```bash
    vercel
    ```
    *   Aceite as configurações padrão (vá apertando Enter).

4.  Para enviar para **produção** (atualizar o site valendo):
    ```bash
    vercel --prod
    ```

## Opção 2: Via GitHub (Recomendado)

1.  Crie um repositório no GitHub para este código.
2.  Vá em [vercel.com/new](https://vercel.com/new).
3.  Importe seu repositório do GitHub.
4.  A Vercel detectará que é um projeto **Vite** automaticamente.
5.  Clique em **Deploy**.

> **Nota sobre o Banco de Dados**:
> Mesmo mudando o site para a Vercel, o **Banco de Dados** e a **Autenticação** continuam no Firebase. Não precisa mudar nada no código!
