# Security Module

O módulo Security disponibiliza os seguintes serviços/componentes:
* AuthService: Provê serviços de autenticação e autorização baseado nas informações do token vindo do backend Demoiselle;
* AuthGuard: Serviço que intercepta acesso as rotas e redireciona para a página de login caso a autenticação seja requerida;
* Diretivas de segurança: Diretivas para exibição de conteúdo de acordo com autenticação/autorização;


## Instalaçao

```bash
npm install --save @demoiselle/security
```


## Utilização e configuração

https://demoiselle.gitbooks.io/documentacao-frontend/content/modulo-security/configurando-sua-aplicacao.html

### Exemplo - Login

Utilizando o serviço para realizar o login:

```javascript
import { AuthService } from '@angular/security';

constructor(private authService: AuthService) {}

// ...código resumido

this.authService.login(this.user)
    .subscribe(res => {
        // Usuário autenticado!
        console.log('Token:', res);
    });
```


## Configuração do AuthServiceProvider

- **_authEndpointUrl_**: string com o endereço do serviço que irá realizar a autenticação;
- **_loginResourcePath_**: string com o caminho do recurso que responde pela operação de login no backend;
- **_tokenKey_** : chave localstorage para acesso ao token jwt;
- **_loginRoute_**: string com a rota que apresenta a tela de login na aplicação;

### Exemplo de configuração

```javascript
{
    authEndpointUrl: '~user/', // ou no formato 'http://localhost:9090/app/api/v1/'
    loginResourcePath: 'auth/login',
    tokenKey: 'id_token',
    loginRoute: '/login'
}
```

## ReToken

O **ReToken** é utilizado para renovar o token JWT automaticamente antes de sua expiração. O intervalo de ReToken é calculado a partir das informações do token (atributos 'exp' e 'iat'). Caso não seja ativado, após a expiração do Token o usuário será redirecionado para a tela de login da aplicação.

Para informações sobre configuração e implementação de segurança com Token JWT no backend Demoiselle consulte a [Documentação JWT Backend](https://demoiselle.gitbooks.io/documentacao-jee/content/jwt.html).

Para ativar, use a propriedade _doReToken_ na configuração do AuthServiceProvider:

```javascript
{
    ...
    doReToken: true,
    ...
}
```

## AuthGuard

Adicione o **AuthGuard** na configuração de rotas para exigir autenticação.
Para isso use o atributo `canActivate`:

```javascript
import { AuthGuard } from '@demoiselle/security';

// ...código resumido
{ 
    path: 'usuario/edit/:id',
    canActivate: [AuthGuard],
    component: UsuarioEditComponent 
}

```

## Utilização das diretivas de segurança

1. Importe o módulo de segurança em sua aplicação;
2. Use as diretivas em seus templates HTML.

```javascript
// Importe #1
import { SecurityModule } from '@demoiselle/security';

@NgModule({
    // Importe #2
    imports: [SecurityModule],

    // ...código resumido
})
```

```html
<!-- Use no seu template HTML -->
<div id="sidebar-menu" *dmlHasRoles="['ADMINISTRATOR']">
```
