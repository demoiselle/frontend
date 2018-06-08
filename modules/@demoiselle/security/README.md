# Security Module

Compatibilidade com o Angular:
- 3.x para Angular 6
- 2.x para Angular 5
- 1.x para Angular 2 e 4

O módulo Security disponibiliza os seguintes serviços/componentes:
* AuthService: Provê serviços de autenticação e reToken;
* TokenService: Provê serviços de armazenamento e acesso ao token de segurança, assim como verificação se o usuário está autorizado (baseado em roles);
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


## Configuração

A classe AuthOptions permite a configuração do módulo Security. As seguintes propriedades podem ser configuradas:

- **_authEndpointUrl_**: (Obrigatório) string com o endereço do serviço que irá realizar a autenticação;
- **_loginResourcePath_**: string com o caminho do recurso que responde pela operação de login no backend;
- **_tokenKey_** : chave localstorage para acesso ao token jwt;
- **_loginRoute_**: string com a rota que apresenta a tela de login na aplicação;
- **_doReToken_**: informa se o re-token deve ser realizado automaticamente antes da expiração do token;
- **_tokenGetter_**: função javascript para obtenção do token;
- **_tokenSetter_**: função javascript para alteração do valor do token;
- **_tokenRemover_**: função javascript para remoção do token;




### Exemplo de configuração

```javascript

    // Demoiselle AuthOptions, using default values except api endpoint
    export class MyAuthOptions extends AuthOptions {
       authEndpointUrl = environment.apiUrl;
    }
    
    // ...
    providers: [
        // ...
        {
          provide: AuthOptions,
          useClass: MyAuthOptions
        },
    ]
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
