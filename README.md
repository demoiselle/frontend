# Demoiselle Frontend [![Build Status](https://travis-ci.org/demoiselle/frontend.svg?branch=master)](https://travis-ci.org/demoiselle/frontend)

Módulo Security [![NPM version][npm-image]](https://www.npmjs.com/package/@demoiselle/security) 
Módulo Http [![NPM version][npm-image]](https://www.npmjs.com/package/@demoiselle/http) 

O Projeto Demoiselle Frontend tem como objetivo oferecer módulos para as terefas mais comuns e que facilitam o desenvolvimento de aplicações integradas com o Backend Demoiselle. Os módulos ficam localizados abaixo de 'modules/@demoiselle'. Acesse a documentação de cada módulo na lista abaixo:

* https://github.com/demoiselle/frontend/tree/master/modules/%40demoiselle/http
* https://github.com/demoiselle/frontend/tree/master/modules/%40demoiselle/security



**Para o desenvolvedor:**
```
git clone https://github.com/demoiselle/frontend.git
npm install
```

Realizando alteração em um módulo (Exemplo: Security) e publicando no repositório NPM
```
cd modules/@demoiselle/security
npm install
(Faça suas alterações)
(Incremente a versão do módulo no arquivo package.json)
npm test
npm run build
npm publish --access=public
```