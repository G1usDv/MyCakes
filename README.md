# MyCakes

Projeto desenvolvido para a feira de Matemática Financeira do colégio. Ele funciona como uma vitrine de bolos de pote com cardápio, carrinho e envio do pedido pelo WhatsApp.

## Por onde começar

- `index.html`: página inicial, com a história da marca e os produtos em destaque.
- `cardapio.html`: página onde a pessoa monta o pedido.
- `estilo/var.css`: cores e fontes do projeto.
- `estilo/style.css`: visual da página inicial.
- `estilo/cardapio.css`: visual do cardápio e do carrinho.
- `estilo/responsividade.css`: ajustes para celular, tablet e telas menores.
- `script/cardapio.js`: lógica do carrinho, QR Code e WhatsApp.

## Como o pedido funciona

1. A pessoa adiciona produtos ao carrinho.
2. O carrinho fica salvo no navegador enquanto ela usa o site.
3. Ao confirmar, o site mostra um QR Code e prepara uma mensagem para o WhatsApp da loja.
4. O pedido é enviado pelo WhatsApp; o site ainda não usa banco de dados ou pagamento online.

## Onde mudar informações importantes

- Produtos, preços e textos: `cardapio.html`.
- Número do WhatsApp: `script/cardapio.js`, na variável `telefoneLoja`.
- Cores e fontes: `estilo/var.css`.
- Imagens: pasta `imagens`.

> O arquivo `script/qrcode.min.js` é uma biblioteca externa comprimida. Evite editar esse arquivo manualmente; o projeto usa a biblioteca pelo arquivo `script/cardapio.js`.
