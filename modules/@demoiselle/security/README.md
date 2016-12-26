Security Module
=======
O módulo Security disponibiliza os seguintes serviços/componentes:
* AuthService: Provê serviços de autenticação e autorização baseado nas informações do token vindo do backend Demoiselle;
* AuthGuard: Serviço que intercepta acesso as rotas e redireciona para a página de login caso a autenticação seja requerida;
* Diretivas de segurança: Diretivas para exibição de conteúdo de acordo com autenticação/autorização;

**Utilização**
```
npm install --save @demoiselle/security
```

Adicionar o serviço de autenticação aos providers da aplicação principal (ou alternativamente no CoreModule), através da chamada a função AuthServiceProvider:
```
import {AuthServiceProvider} from '@demoiselle/security';
...
@NgModule({
...
providers: [
    AuthServiceProvider({
          'authEndpointUrl': 'http://localhost:9090/app/api/v1/'
          'loginResourcePath': 'auth/login',
          'tokenKey': 'id_token',
          'loginRoute': '/login'
        }),
    ...
]})
export class AppModule {..}
```
Utilizando o serviço para realizar o login:
```
import { AuthService} from '@angular/security';
constructor(private authService: AuthService) {}
...
this.authService.login(this.user).subscribe(res => {//success});
```

**Configuração do AuthServiceProvider:**
 - authEndpointUrl: string com o endereço do serviço que irá realizar a autenticação;
 - loginResourcePath: string com o caminho do recurso que responde pela operação de login no backend;
 - tokenKey : chave localstorage para acesso ao token jwt;
 - loginRoute: string com a rota que apresenta a tela de login na aplicação;

Exemplo de configuração:
```
{
    'authEndpointUrl': '~user/', // ou no formato 'http://localhost:9090/app/api/v1/'
    'loginResourcePath': 'auth/login',
    'tokenKey': 'id_token',
    'loginRoute': '/login'
}
```
**Retoken**

O re-token é utilizado para renovar o token JWT antes de sua expiração. Para ativar o re-token utilize a função de inicialização de polling de re-token. Esta função configura o polling de acordo com o tempo de expiração contido no token. Pode ser inicializado através da sua chamada em sua função app.component.ts::ngAfterContentInit():
```
public ngAfterContentInit():any {
    ...
    this.authService.initializeReTokenPolling();
}
```

**Utilização do AuthGuard**

Adicione o AuthGuard na configuração de rotas para exigir autenticação. Para isso utilize o atributo 'canActivate':
```
import {AuthGuard} from '@demoiselle/security';
...
{ 
    path: 'usuario/edit/:id',
    canActivate: [AuthGuard],
    component: UsuarioEditComponent 
}

```

**Utilização das diretivas de segurança**

Importe o módulo de segurança em sua aplicação e utilize as diretivas em seus templates:
```
import { SecurityModule } from '@demoiselle/security';
@NgModule({
  imports: [SecurityModule],
  ...
})

Template:
<div id="sidebar-menu" *dmlHasRoles="['ADMINISTRATOR']">

```
