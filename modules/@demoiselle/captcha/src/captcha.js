/* 
 * SERVIÇO CAPTCHA SERPRO.GOV.BR
 * Criado em 20/06/2013
 * Alterado em 17/07/2015
 * Versão 1.34
 */
captcha_serpro_gov_br = function(){
    this.url = location.protocol + "//captcha2.servicoscorporativos.serpro.gov.br";
    
    this.tokenCaptcha = "";
    this.textoEmbaralhado = null;
    this.ultimoTokenSomTocado = "";
    this.clienteId = "";
    this.refElementoAudioHTML5 = null;
    this.refElementoAudioEmbed = null;
    this.refElementoDiv = null;
    this.refElementoDivContainerUI = null;
    this.refElementoDivContainerCaptcha = null;
    this.refElementoDivButtons = null;
    this.refElementoImg = null;
    this.refElementoInputTexto = null;
    this.refElementoLabelTexto = null;
    this.refElementoInputHiddenTokenCaptcha = null;
    this.refElementoRecarregar = null;
    this.refElementoTocarSom = null;
    this.refElementoStyle = null;
    
    var ref = this;
    
    var xmlHttp = null;
    var xmlIEHttp = null;
    
    try{
        //IE8 e IE9 não suporta crossdomain por XMLHttpRequest
        xmlIEHttp = new XDomainRequest();
    }
    catch(err){
        xmlHttp =new XMLHttpRequest();
    }

    //IE < 9 não suporta o padrão.
    this.addEventClick = function(elementoHTML, callBack){
        if (window.addEventListener) {
            elementoHTML.addEventListener("click", callBack, false);
        } else if (window.attachEvent) {
            elementoHTML.attachEvent("onclick", callBack);
        }
    };
    
    //Valida texto digitado. Usado somente para testes.
    this.validar = function(texto){
        if (!(texto)){
            if (this.refElementoInputTexto){
                texto = this.refElementoInputTexto.value;
            }
            else{
                texto = "";
            }
        }
        if (texto === ""){
            return false;
        }
        dados = this.clienteId + "&" + this.tokenCaptcha + "&" + texto;
        this.postRESTStringAsync("/captchavalidar/1.0.0/validar", dados, 
            function(retorno){
                if (retorno == "1"){
                    alert('Sucesso!');
                }
                else if (retorno == "2"){
                    alert('Token não encontrado!');
                }
                else{
                    alert('Incorreto');
                }
            },
            function(retorno){
                alert('Erro: ' + retorno);
            }
        );
    };
    
    //Recarrega uma nova imagem captcha usando ajax.
    this.recarregar = function(){
        var stringResposta;
        var dados;
        var tempMatriz;
        var imagemBase64;

        if (this.refElementoImg !== null){
            dados = this.clienteId;
            this.postRESTStringAsync("/captcha/1.0.0/imagem", dados,
                function(stringResposta){
                    if (ref.refElementoInputTexto){
                        if (ref.tokenCaptcha !== ""){
                            ref.refElementoInputTexto.value = "";
                            ref.refElementoInputTexto.focus();
                        }
                    }

                    tempMatriz = stringResposta.split("@");
                    ref.tokenCaptcha = tempMatriz[0];
                    if (ref.refElementoInputHiddenTokenCaptcha !== null){
                        ref.refElementoInputHiddenTokenCaptcha.value = ref.tokenCaptcha;
                    }
                    imagemBase64 = "data:image/png;base64," + tempMatriz[1];
                    ref.refElementoImg.src = imagemBase64;
                    if (tempMatriz.length > 2){
                        //this.textoEmbaralhado = JSON.parse(tempMatriz[2]);
                        //Mobile: Em construção.
                        //alert(this.textoEmbaralhado[1].codigo0);
                    }
                }
                ,
                function(erro){
                    console.log("Erro captcha: " + erro);
                    //alert("Servidor muito ocupado. Tente novamente.");
                }
            );
        }
    };

    //Executa som
    this.tocarSom = function(){
        var navegadorIE = false;
        var url = this.url + "/captcha/2.0.0/som/som.wav?" + this.tokenCaptcha;
        
        if(navigator.userAgent.indexOf("Trident")!=-1){
            navegadorIE = true;
        }
        trace("tocarSom start. IE=" + navegadorIE);
        
        if (this.tokenCaptcha){
            try{
                if (navegadorIE === true){
                    if (this.refElementoAudioEmbed){
                        document.body.removeChild(this.refElementoAudioEmbed);
                        this.refElementoAudioEmbed = null;
                    }
                    this.refElementoAudioEmbed = document.createElement("embed");
                    this.refElementoAudioEmbed.setAttribute("hidden", true);
                    this.refElementoAudioEmbed.setAttribute("enablejavascript", true);
                    this.refElementoAudioEmbed.setAttribute("autostart", true);
                    this.refElementoAudioEmbed.setAttribute("src", url);
                    document.body.appendChild(this.refElementoAudioEmbed);
                    trace("tocarSom URL=" + url);
                }
                else{
                    if (this.refElementoAudioHTML5 === null){
                        this.refElementoAudioHTML5 = document.createElement("audio");
                        document.body.appendChild(this.refElementoAudioHTML5);
                    }
                    this.refElementoAudioHTML5.src = url;
                    this.refElementoAudioHTML5.load();
                    this.refElementoAudioHTML5.play();
                }
                this.ultimoTokenSomTocado = this.tokenCaptcha;

                if (this.refElementoInputTexto){
                    this.refElementoInputTexto.value = "";
                    this.refElementoInputTexto.focus();
                }
            }
            catch (err){
                if (err instanceof captchaException){
                    alert('Erro ao executar som. ' + err.mensagem);
                }
                else{
                    alert('Erro ao executar som.');
                }
            }
        }
    };
    
    //Cria elementos de imagem, buttons e caixa de entrada dentro de uma div
    //elementoDiv pode ser uma string contendo o id do elemento ou um objeto referenciando o elemento.
    this.criarUI = function(elementoDiv, p_perfilcss, p_input, prefixo_id){
        var ref;
        ref = this;
        
        if (!(p_perfilcss)){
            p_perfilcss = "";
        }
        
        if (!(p_input)){
            p_input = false;
        }
        
        if (!(prefixo_id)){
            prefixo_id = "";
        }
    
        if (elementoDiv){
            if (typeof(elementoDiv) === "object"){
                this.refElementoDiv = elementoDiv;
            }
            else{
                this.refElementoDiv = document.getElementById(elementoDiv);
            }
        }
        else{
            //Caso não especifique nenhuma div, o captcha é criado como filho direto do elemento body
            this.refElementoDiv = document.createElement("div");
            document.body.appendChild(this.refElementoDiv);
        }

        this.refElementoDivContainerUI = document.createElement("div");
        this.refElementoDivContainerUI.id = prefixo_id + "divContainerUI_captcha_serpro_gov_br";
        this.refElementoDiv.appendChild(this.refElementoDivContainerUI);

        this.refElementoDivContainerCaptcha = document.createElement("div");
        this.refElementoDivContainerCaptcha.id = prefixo_id + "divContainerCaptcha_captcha_serpro_gov_br";
        this.refElementoDivContainerUI.appendChild(this.refElementoDivContainerCaptcha);
        
        //elemento img captcha
        this.refElementoImg = document.getElementById(prefixo_id + "img_captcha_serpro_gov_br");
        if (!(this.refElementoImg)){
            this.refElementoImg = document.createElement("img");
            this.refElementoImg.setAttribute("alt","Imagem captcha");
            this.refElementoImg.id = prefixo_id + "img_captcha_serpro_gov_br";
            this.refElementoImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAAyCAYAAAD1JPH3AAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAOwwAADsMBx2+oZAAAAAd0SU1FB98HDhIGOWu+9+kAAAB3SURBVHja7dIBDQAACMMwwL/n4wNaCcs6SQqOGAkwNBgaDA2GxtBgaDA0GBoMjaHB0GBoMDQYGkODocHQYGgwNIYGQ4OhwdBgaAwNhgZDg6HB0BgaDA2GBkODoTE0GBoMDYbG0GBoMDQYGgyNocHQYGgwNBiabxY7GwRg7rtJrAAAAABJRU5ErkJggg==";
            this.refElementoDivContainerCaptcha.appendChild(this.refElementoImg);
        }
        this.addEventClick(this.refElementoImg, function(){ref.recarregar();});

        this.refElementoDivButtons = document.getElementById(prefixo_id + "divButtons_captcha_serpro_gov_br");
        if (!(this.refElementoDivButtons)){
            this.refElementoDivButtons = document.createElement("div");
            this.refElementoDivButtons.id = prefixo_id + "divButtons_captcha_serpro_gov_br";
            this.refElementoDivContainerCaptcha.appendChild(this.refElementoDivButtons);
        }
        
        //elemento button recarregar captcha
        this.refElementoRecarregar = document.getElementById(prefixo_id + "btnRecarregar_captcha_serpro_gov_br");
        if (!(this.refElementoRecarregar)){
            this.refElementoRecarregar = document.createElement("img");
            this.refElementoRecarregar.id = prefixo_id + "btnRecarregar_captcha_serpro_gov_br";
            this.refElementoRecarregar.setAttribute("title","Recarregar imagem");
            this.refElementoRecarregar.setAttribute("alt","Recarregar imagem");
            this.refElementoRecarregar.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAWCAYAAAArdgcFAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAArlJREFUeNqsVV1IFFEU/mZ2Vg1DyXSj1Q3MMgih7QeptwhEoofAJdGnfKnoIaP3eg7qpR+QfChiHxQqkZYsKIUsCbKUaqkwZVf8KXbd2v//2bmdO7iSuzOrsXvgwMyce8/5zne+e0dgjOGh4ylraLBAYQqKNZ7P5Xbj4plOQRh89ZIZKyoQjsUgZzJFJxcEAZLBAK/HA0k0GuEPhQg1Q6ksswpSymSUTSP+ubgIs8WyuQKKApERz4qyOe+/cRNDdjti0eiGaxm5xFvIFEDuI+4+TEzA/WMWqWQSk2/ewjk1jZM2Gw4dO1oQucSnyytp2fvxcbx4MpQXjxPyMYcD2011sDQ2au5VCiF3fpzCyKPHEEURJ9rb0XLQiv5bt5FOpXC8rQ2nbB2IyzLS5HpDVQeam1xOpzFKyLh19/TASu0nKGlTczM6urtQXVuLAKFnBRSm8OSKko98fnYWoUAAu6jl/UcO408wqH4/d7kX/nB47X0jtWjSEiHdc9tNSIOULGu/fL513fm8XpSVlaGmrk6TFpETny2Qdb6BWzgUzItlfdHlhv3OXbweea4Z57SIWoEd5no1+fcvTkQjEc3NX6en1DVNe/foAtBEXlldhRarVT0szwYGEfQH1mJyWsa70TF8+/QZ5XQnHWht1U6ux3ksHsdpUgU/7kvz8xjo64PJbEb5lgp4lpYRpoFyiZ69cB4JHSmvqkXRDAYJ9ZVrVzFMyKcnJ4lj11psZ309ukiixq2V6waeO1Dh+oP7bMXv11xglCRYCLGBnudmZhCLRNG0rxnbSOcLy9QBAdCzCBWVsheNliXp4MwRLbxIlcmEGrOE3zTgpX8kqXuIOOd6tOS2mKBL639M5Vymu0EPeTG/OlUtHu8KmACIBkPJEicTCZpPBAJ/6ey9xASSFkr0q+P3/vC9fuGvAAMAvvxJK7Jm6mwAAAAASUVORK5CYII=";
            this.refElementoDivButtons.appendChild(this.refElementoRecarregar);
        }
        this.addEventClick(this.refElementoRecarregar, function(){ref.recarregar();});
        
        //elemento button tocar som
        this.refElementoTocarSom = document.getElementById(prefixo_id + "btnTocarSom_captcha_serpro_gov_br");
        if (!(this.refElementoTocarSom)){
            this.refElementoTocarSom = document.createElement("img");
            this.refElementoTocarSom.id = prefixo_id + "btnTocarSom_captcha_serpro_gov_br";
            this.refElementoTocarSom.setAttribute("title","Tocar som");
            this.refElementoTocarSom.setAttribute("alt","Tocar som");
            this.refElementoTocarSom.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAWCAYAAAArdgcFAAAABmJLR0QA/wD/AP+gvaeTAAACkklEQVQ4ja2Uu08UURSHv5nZSaBSaYzyKn3GKAUmJj46Syr5Hyy00N5aW220s1MroxYaIRETg5tARDTRJYiCguuOKBH3aeacYzE7lx1AfOBJprl393e++c6945mZXb97h66ubtSUzZaZ8fbdO06fGsS7MfTQwrY2vlerxCKbDvc8j1wQEJVK5PwwZGl5GTVLdzeDDYA0IXMi6ojNQE3x0karSs3wN2ju+wE0t0WVnJmiuuJaf6NGftEYwEi0AJgqvojQ+qjqXz/XL19hMYpQbclKyC1LroqtQ/dyfJxatUb/saNr9orz8zTqdUQMzzOXkyGP4/XpJ/J5ngwNExU/urVvS0vcu3krGV4TUCTOWPBFtEVJVpGIMJHPk380QlQsYmpuvVqp8HryOSKCASqa+b+KkEsXWrUATDzNU62UKUy+YLFUSoZkRlQsUnz/gR093WArB0BUEFnRK6rk0k5u4maYGc9GR12oa9wMnxwbY3tnpwtJoeJY3DWRhFxduCXpmBn7Dx2k+r3Mm6kpvi4uusZbt3WwZ/8+RBMdq52nR1FF1pKrGR5wcmCAMAwZuf+A0ZERvn75gpmys6ebXXt2UygUHKE1w1SF9BatIW8NX/j0CYDDJ47jBz6Ph4YxM8qVCuVKhSAI6O7tdTMS1T9w3lST1sdSib4jRwjDkPmFBffbLR0dnD5/junZ2RXnIuntT0+LbhieNtjb18eB/n73RrVajcLMDABt7e2YWebTIes5N2ctW8UoWmc1qQuXLjIzN0e90chqSW/c78I3qlfT026wTksa7sjN/ul73vrmaakIuTiOM+Srff9LmVmipRR9xjzwg2DToWlwo16nWi7jmZkNnj2D5/v/hRrgR6PB7avX+Akpt4HKebmbmQAAAABJRU5ErkJggg==";
            this.refElementoDivButtons.appendChild(this.refElementoTocarSom);
        }
        this.addEventClick(this.refElementoTocarSom, function(){ref.tocarSom();});
        
        //elemento input hidden token captcha
        this.refElementoInputHiddenTokenCaptcha = document.createElement("input");
        this.refElementoInputHiddenTokenCaptcha.type = "hidden";
        this.refElementoInputHiddenTokenCaptcha.id = prefixo_id + "txtToken_captcha_serpro_gov_br";
        this.refElementoInputHiddenTokenCaptcha.name = "txtToken_captcha_serpro_gov_br";
        this.refElementoInputHiddenTokenCaptcha.value = "";
        this.refElementoDivContainerUI.appendChild(this.refElementoInputHiddenTokenCaptcha);
        
        //elemento input texto captcha
        if (p_input === true){
            this.refElementoInputTexto = document.getElementById(prefixo_id + "txtTexto_captcha_serpro_gov_br");
            if (!(this.refElementoInputTexto)){
                this.refElementoLabelTexto = document.createElement("label");
                this.refElementoLabelTexto.id = prefixo_id + "lblTexto_captcha_serpro_gov_br";
                this.refElementoLabelTexto.setAttribute("for","txtTexto_captcha_serpro_gov_br");
                this.refElementoLabelTexto.appendChild(document.createTextNode("Digite os caracteres acima:"));
                this.refElementoDivContainerUI.appendChild(this.refElementoLabelTexto);

                this.refElementoInputTexto = document.createElement("input");
                this.refElementoInputTexto.id = prefixo_id + "txtTexto_captcha_serpro_gov_br";
                this.refElementoInputTexto.name = "txtTexto_captcha_serpro_gov_br";
                this.refElementoInputTexto.value = "";
                this.refElementoDivContainerUI.appendChild(this.refElementoInputTexto);
            }
        }
        
        if (p_perfilcss !== ""){
            var tempTextoStyle;

            if (p_perfilcss === "css"){
                tempTextoStyle = "#divContainerUI_captcha_serpro_gov_br {width: 210px; border: 1px solid black; padding: 8px;  border-radius: 1em; box-shadow: black 0px 0px 8px 1px;} ";
            }
            else if (p_perfilcss === "css1"){
                tempTextoStyle = "#divContainerUI_captcha_serpro_gov_br {width: 210px; border: 1px solid black; padding: 4px;} ";
            }
            else if (p_perfilcss === "css2"){
                tempTextoStyle = "#divContainerUI_captcha_serpro_gov_br {width: 210px;} ";
            }
            else if (p_perfilcss === "css3"){
                tempTextoStyle = "#divContainerUI_captcha_serpro_gov_br {width: 100%;} ";
            }
            
            tempTextoStyle += "#divContainerCaptcha_captcha_serpro_gov_br {width: 100%;} ";
            tempTextoStyle += "#divButtons_captcha_serpro_gov_br {width: 20px; float:right;} ";
            tempTextoStyle += "#txtTexto_captcha_serpro_gov_br {display: block; width: 100%; border: 1px solid;} ";
            tempTextoStyle += "#lblTexto_captcha_serpro_gov_br {font-family: 'Times New Roman'; font-size:1em} ";
            tempTextoStyle += "#lblTextoErro_captcha_serpro_gov_br{font-family: 'Times New Roman'; font-size:1em; color:red;} ";
            this.refElementoStyle = document.createElement("style");
            this.refElementoStyle.setAttribute("type", "text/css");
            
            if (this.refElementoStyle.styleSheet){
                //IE
                this.refElementoStyle.styleSheet.cssText = tempTextoStyle;
                document.getElementsByTagName("body")[0].appendChild(this.refElementoStyle);
            }
            else{
                this.refElementoStyle.appendChild(document.createTextNode(tempTextoStyle));
                this.refElementoStyle.setAttribute("type", "text/css");
                this.refElementoDiv.appendChild(this.refElementoStyle);
            }
        }
        
        this.recarregar();
    };
    
    //Destroi elementos criados dinamicamente
    this.destruir = function(){
        if (this.refElementoDiv !== null){
            if (this.refElementoDivContainerUI !== null){
                this.refElementoDiv.removeChild(this.refElementoDivContainerUI);
            }
            if (this.refElementoStyle !== null){
                this.refElementoDiv.removeChild(this.refElementoStyle);
            }
        }
        if (this.refElementoAudioHTML5 !== null){
            document.body.removeChild(this.refElementoAudioHTML5);
        }
        
        this.refElementoAudioHTML5 = null;
        this.refElementoAudioEmbed = null;
        this.refElementoDiv = null;
        this.refElementoDivContainerUI = null;
        this.refElementoDivContainerCaptcha = null;
        this.refElementoDivButtons = null;
        this.refElementoImg = null;
        this.refElementoInputTexto = null;
        this.refElementoLabelTexto = null;
        this.refElementoInputHiddenTokenCaptcha = null;
        this.refElementoRecarregar = null;
        this.refElementoTocarSom = null;
        this.refElementoStyle = null;

        this.ultimoTokenSomTocado = "";
    };
    
    //Envia dados AJAX para o servidor
    this.postRESTStringAsync = function(RESTUri, dados, callBackSucesso, callBackErro, contReconexao){
        

        if (contReconexao){
            trace("Reconectando: " + contReconexao);
        }

        
        
        try{
            if (xmlHttp !== null){
                xmlHttp.open("POST", this.url + RESTUri, true);
                xmlHttp.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
                xmlHttp.onreadystatechange = monitoraXMLHttpRequest;
                xmlHttp.send(dados);
            }
            else if (xmlIEHttp !== null){
                xmlIEHttp.open("POST", this.url + RESTUri);
                xmlIEHttp.onload = monitoraXMLIEHttpRequestLoad;
                xmlIEHttp.onerror = monitoraXMLIEHttpRequestErro;
                xmlIEHttp.ontimeout = monitoraXMLIEHttpRequestErro;
                xmlIEHttp.send(dados);
            }
        }
        catch(err){
            throw new captchaException(-1, "Servidor captcha não responde.");
        }

        function monitoraXMLIEHttpRequestErro(){
            callBackErro("Serviço captcha indisponível.");
        }
        function monitoraXMLIEHttpRequestLoad()
        {
            callBackSucesso(xmlIEHttp.responseText);
        }

        function monitoraXMLHttpRequest()
        {
            if (xmlHttp.readyState === 4){
                if (xmlHttp.status === 200){
                    if (xmlHttp.responseText){
                        callBackSucesso(xmlHttp.responseText);
                    }
                    else{
                        callBackErro("Serviço captcha indisponível.");
                    }
                }
                else if (xmlHttp.status === 0){
                    //No máximo 9 tentativas de reconexão
                    if (contReconexao){
                        contReconexao++;
                    }
                    else{
                        contReconexao = 1;
                    }
                    if (contReconexao > 2){
                        //Depois da segunda tentativa, é usado um delay de um segundo
                        if (contReconexao < 10){
                            setTimeout(function(){ref.postRESTStringAsync(RESTUri, dados, callBackSucesso, callBackErro, contReconexao);}, 1000);
                        }
                    }
                    else{
                        ref.postRESTStringAsync(RESTUri, dados, callBackSucesso, callBackErro, contReconexao);
                    }
                }
                else{
                    callBackErro("Serviço captcha indisponível.");
                }
            }
        }
    };

    function captchaException (codigo, mensagem){
      this.codigo = codigo;
      this.mensagem = mensagem;
    }

    function trace(mensagem){
        try{
            if ((console) && (console.log)){
                console.log(mensagem);
            }
        }
        catch(e){

        }
    }
};


//Início automático
(function(){
try{
    var oCaptcha_serpro_gov_br;

    //IE < 9
    if(typeof String.prototype.trim !== 'function') {
        String.prototype.trim = function() {
            return this.replace(/^\s+|\s+$/g, '');
        };
    }

    function encontrarDIVPorAtributo(elementoPai, atributo){
        var elementoItem;

        if (document.querySelectorAll){
            listaElementos = document.querySelectorAll("[" + atributo + "]");
            if (listaElementos.length > 0){
                return listaElementos[0];
            }
        }
        else{
            for (var i = 0; i < elementoPai.length; i++) {
                elementoItem = elementoPai[i];
                if (elementoItem.nodeType === 1){
                    if (elementoItem.getAttribute(atributo) || (elementoItem.getAttribute(atributo) === "")) {
                        return elementoItem;
                    }
                    else{
                        if ((elementoItem.childNodes) && (elementoItem.childNodes.length > 0)){
                            elementoItem = encontrarDIVPorAtributo(elementoItem.childNodes, atributo);
                            if (elementoItem){
                                return elementoItem;
                            }
                        }
                    }
                }
            }
        }
    }

    //Início automático do captcha.
    iniciarFunction = function(){
        var elemento;
        var tempConfig;
        var p_perfilcss;
        var p_input;
        var itemConfig;
        
        ref = this;
        
        elemento = encontrarDIVPorAtributo(document.body.childNodes, 'data-ui-captcha-serpro');
        if (elemento){
            p_perfilcss = "";
            p_input = false;
            tempConfig = "";
            
            tempConfig = elemento.getAttribute("data-config");
            if (tempConfig === null){
                tempConfig = elemento.getAttribute("data-ui-captcha-serpro");
                if (tempConfig === ""){
                    tempConfig = null;
                }
            }
            if (tempConfig){
                var tempConfigM;
                tempConfigM = tempConfig.split(";");
                for (var i2=0; i2<tempConfigM.length; i2++){
                    itemConfig = tempConfigM[i2].trim();
                    if (itemConfig == "css"){
                        p_perfilcss = "css";
                    }
                    if (itemConfig == "css1"){
                        p_perfilcss = "css1";
                    }
                    if (itemConfig == "css2"){
                        p_perfilcss = "css2";
                    }
                    if (itemConfig == "css3"){
                        p_perfilcss = "css3";
                    }
                    if (itemConfig == "input"){
                        p_input = true;
                    }
                }
            }

            oCaptcha_serpro_gov_br = new captcha_serpro_gov_br();

            if (elemento.getAttribute('data-url')){
                var tempURL;
                tempURL = location.protocol;
                if (location.port !== ""){
                    tempURL = tempURL + ":" + location.port;
                }
                tempURL = tempURL + "//" + location.hostname + elemento.getAttribute('data-url');
                oCaptcha_serpro_gov_br.url = tempURL;
            }
            
            if (elemento.getAttribute('data-clienteid')){
                oCaptcha_serpro_gov_br.clienteId = elemento.getAttribute('data-clienteid');
            }
            oCaptcha_serpro_gov_br.criarUI(elemento, p_perfilcss, p_input);
        }


        var elementoValidar;
        elementoValidar = encontrarDIVPorAtributo(document.body.childNodes, 'data-ui-validar-captcha-serpro');
        if (elementoValidar){
            if (window.addEventListener) {
                elementoValidar.addEventListener("click",function(){oCaptcha_serpro_gov_br.validar();});    
            }
            else{
                elementoValidar.attachEvent("onclick",function(){oCaptcha_serpro_gov_br.validar();});
            }
        }
    };

    if (window.addEventListener) {
        window.addEventListener("load", iniciarFunction, false);
    } else if (window.attachEvent) {
        //IE < 9
        window.attachEvent("onload", iniciarFunction);
    }
}
catch(err){

}
})();