Http Service
=======

Serviço Http Angular 2 com as seguintes características:
* Adição automática de header para o token JWT no cabeçalho http de cada requisição;
* Através da configuração de endpoints, permite a utilização da chave do endpoint ao invés de toda a url em cada requisição.
Exemplo:
Considerando a configuração {'endpoints' : {'main': 'http://localhost/app/api/v1'}}
Podemos utilizar a seguinte chamada: this.http.get('~main/users')
Que vai gerar uma requisição para: 'http://localhost/app/api/v1/users';
* Interceptador para tratamento de erros;

**Utilização**
```
npm install --save @demoiselle/http
```

Adicionar o serviço aos providers da aplicação principal, através da chamada a função HttpServiceProvider:
```
import {HttpServiceProvider} from '@demoiselle/http';
...
@NgModule({
...
providers: [
    HttpServiceProvider({
      'endpoints': process.env.CONF.endpoints, 
      'multitenancy': process.env.CONF.multitenancy,
      'unAuthorizedRoute': '/login',
      'tokenKey' : 'id_token'
    }),
    ...
]})
export class AppModule {..}
```
Fazer as requisições normalmente utilizando o serviço Http:
```
import { Http} from '@angular/http';
constructor(private http: Http) {}
...
this.http.get('~main/users');
```

**Configuração do HttpServiceProvider:**
 - endpoints: objeto com a lista de endpoints disponíveis para a applicação
 - multitenancy: configuração de multitenancy
 - unAuthorizedRoute: string com o valor da rota para redirecionamento quando servidor responder 401-unauthorized
 - tokenKey : chave localstorage para acesso ao token jwt 

Exemplo de configuração:
```
  {
   'endpoints' : { 
       'main': 'http://localhost:9090/app/api/v1',
       'main2': 'http://localhost:9090/app2/api/v1'
   },
   'multitenancy': {
       'active': false,
       'apiUrl': 'http://localhost:9090/users/api/v1/'
   },
   'unAuthorizedRoute' : '/login',
   'tokenKey' : 'id_token'
  }
```
