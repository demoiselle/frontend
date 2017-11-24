# Serviços Http

São disponibilizados os seguintes serviços:
* Interceptador para adição automática de header para o token JWT no cabeçalho de cada requisição;
* Serviço para tratamento de erros;
* Serviço que oferece acesso aos serviços REST do backend Demoiselle;

### AuthInterceptor

Utilize o AuthInterceptor caso esteja utilizando a segurança por Token integrada com o backend Demoiselle.
Dependência: TokenService do módulo @demoiselle/security.

### ExceptionService

Utilize o Observable oferecido pelo ExceptionService para efetuar o tratamento de erros de comunicação com o backend. Ex: Erros de validação (412), erros de autorização, erros no servidor, etc...

### DataService

Para aproveitar a implementação de métodos padrão para acesso à Api REST Demoiselle crie seu serviço estendendo a classe DataService informando o recurso a ser acessado via configuração no construtor.


## Instalação

```bash
npm install --save @demoiselle/http
```


## Utilização e configuração

https://demoiselle.gitbooks.io/documentacao-frontend/content/m%C3%B3dulo-http/configurando-sua-aplicacao.html




