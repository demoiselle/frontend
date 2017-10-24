# Http Service

Serviço Http Angular 2 com as seguintes características:
* Adição automática de header para o token JWT no cabeçalho http de cada requisição;
* Através da configuração de endpoints, permite a utilização da chave do endpoint ao invés de toda a url em cada requisição.
* Interceptador para tratamento de erros;


## Instalação

```bash
npm install --save @demoiselle/http
```


## Utilização e configuração

https://demoiselle.gitbooks.io/documentacao-frontend/content/m%C3%B3dulo-http/configurando-sua-aplicacao.html


### Exemplo - GET Request

Para fazer as requisições, use o serviço `Http` do angular:

```javascript
import { Http } from '@angular/http';

constructor(private http: Http) {}

// ...código resumido...

this.http.get('~main/users');
```


## Configuração do HttpServiceProvider

- **_endpoints_**: objeto com a lista de endpoints disponíveis para a applicação
- **_multitenancy_**: configuração de multitenancy
- **_unAuthorizedRoute_**: string com o valor da rota para redirecionamento quando servidor responder 401-unauthorized
- **_tokenKey_**: chave localstorage para acesso ao token jwt 

### Exemplo de configuração

```javascript
{
    endpoints : {
        main: 'http://localhost:9090/app/api/v1',
        main2: 'http://localhost:9090/app2/api/v1'
    },
    multitenancy: {
        active: false,
        apiUrl: 'http://localhost:9090/users/api/v1/'
    },
    unAuthorizedRoute : '/login',
    tokenKey : 'id_token'
}
```

### Exemplo de uso
> Considerando a configuração<br>
> `{'endpoints' : {'main': 'http://localhost/app/api/v1'}}`<br>
> Podemos utilizar a seguinte chamada:<br>
> `this.http.get('~main/users')`<br>
> Que vai gerar uma requisição para:
> `'http://localhost/app/api/v1/users'`