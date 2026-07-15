// Este arquivo cuida do carrinho, do QR Code e da mensagem para o WhatsApp.

// Pegamos no HTML tudo o que o JavaScript precisa mostrar, esconder ou atualizar.
const btnAbrir = document.querySelector('.btn-carrinho')
const fechar = document.querySelector('.fechar')
const overlay = document.querySelector('.overlay')
const carrinho = document.querySelector('.carrinho')

// Partes internas do carrinho e do formulário de pedido.
const containerItens = document.querySelector('.itens-carrinho')
const totalElemento = document.getElementById('valor-total')
const formCheckout = document.getElementById('form-checkout')
const modalQrcode = document.getElementById('modal-qrcode')
const qrcodeContainer = document.getElementById('qrcode-container')
const btnWhatsapp = document.getElementById('btn-whatsapp')
const contadorCarrinho = document.getElementById('contador-carrinho')

// Itens do carrinho. O localStorage faz a lista continuar ali mesmo se a página for atualizada.
let itensCarrinho = JSON.parse(localStorage.getItem('mycakes_carrinho')) || []

// Mostra o fundo escuro e traz a gaveta do carrinho para a tela.
function abrirCarrinho(){
    overlay.classList.add('ativo')
    carrinho.classList.add('ativo')
}

// Faz o contrário: esconde a gaveta e libera a página novamente.
function fecharCarrinho(){
    carrinho.classList.remove('ativo')
    overlay.classList.remove('ativo')
}

// Liga os cliques do botão, do "Fechar" e do fundo escuro às funções acima.
btnAbrir.addEventListener('click', abrirCarrinho)
fechar.addEventListener('click', fecharCarrinho)
overlay.addEventListener('click', fecharCarrinho)

// Atualiza a bolinha vermelha que informa quantos itens existem no carrinho.
function atualizarContador() {
    // Soma a quantidade total de todos os itens do carrinho (ex: 2 bolos + 1 refri = 3)
    const totalItens = itensCarrinho.reduce((acc, item) => acc + item.quantidade, 0)
    
    if (totalItens > 0) {
        contadorCarrinho.textContent = totalItens
        contadorCarrinho.style.display = "block" // Mostra a bolinha vermelha
    } else {
        contadorCarrinho.style.display = "none" // Esconde se estiver vazio
    }
}

// Quando alguém clica em "Adicionar", usamos os dados guardados no próprio botão.
document.querySelectorAll('.btn-adicionar').forEach(botao => {
    botao.addEventListener('click', () => {
        const id = botao.getAttribute('data-id')
        const nome = botao.getAttribute('data-nome')
        const preco = parseFloat(botao.getAttribute('data-preco'))

        // Verifica se o item já existe no carrinho
        const itemExistente = itensCarrinho.find(item => item.id === id)

        if (itemExistente) {
            itemExistente.quantidade += 1
        } else {
            itensCarrinho.push({ id, nome, preco, quantidade: 1 })
        }

        salvarAtualizar()
        abrirCarrinho() // Abre o carrinho automaticamente para feedback visual
    })
})

// Salva a lista no navegador e redesenha o carrinho na tela.
function salvarAtualizar() {
    localStorage.setItem('mycakes_carrinho', JSON.stringify(itensCarrinho))
    renderizarCarrinho()
}

// Cria novamente a lista visual do carrinho sempre que ela muda.
function renderizarCarrinho() {
    containerItens.innerHTML = ""
    atualizarContador()

    if (itensCarrinho.length === 0) {
        containerItens.innerHTML = '<p class="carrinho-vazio">Seu carrinho está vazio.</p>'
        totalElemento.textContent = "R$ 0,00"
        return
    }

    let totalGeral = 0

    itensCarrinho.forEach(item => {
        const subtotal = item.preco * item.quantidade
        totalGeral += subtotal

        const divItem = document.createElement('div')
        divItem.classList.add('item-carrinho-lista')
        // Estes estilos montam uma linha simples: produto, quantidade e subtotal.
        divItem.style.display = "flex"
        divItem.style.justifyContent = "space-between"
        divItem.style.alignItems = "center"
        divItem.style.marginBottom = "15px"
        divItem.style.paddingBottom = "10px"
        divItem.style.borderBottom = "1px solid #eee"

        divItem.innerHTML = `
            <div>
                <strong style="color: #4A2031;">${item.nome}</strong><br>
                <span style="color: #666;">R$ ${item.preco.toFixed(2).replace('.', ',')}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 10px;">
                <button onclick="alterarQtd('${item.id}', -1)" style="padding: 2px 8px; cursor:pointer;">-</button>
                <span>${item.quantidade}</span>
                <button onclick="alterarQtd('${item.id}', 1)" style="padding: 2px 8px; cursor:pointer;">+</button>
            </div>
            <div>
                <strong>R$ ${subtotal.toFixed(2).replace('.', ',')}</strong>
            </div>
        `
        containerItens.appendChild(divItem)
    })

    totalElemento.textContent = `R$ ${totalGeral.toFixed(2).replace('.', ',')}`
}

// Muda a quantidade. Ela fica no "window" porque os botões + e - são criados dentro do HTML acima.
window.alterarQtd = function(id, alteracao) {
    const item = itensCarrinho.find(item => item.id === id)
    if (item) {
        item.quantidade += alteracao
        if (item.quantidade <= 0) {
            itensCarrinho = itensCarrinho.filter(item => item.id !== id)
        }
        salvarAtualizar()
    }
}

// Ao abrir a página, mostra os itens que já estavam salvos no navegador.
renderizarCarrinho()

// Quando o formulário é enviado, montamos os dados do pedido e mostramos o QR Code.
formCheckout.addEventListener('submit', (e) => {
    e.preventDefault()

    if (itensCarrinho.length === 0) {
        alert("Adicione pelo menos um bolo ao carrinho antes de finalizar!")
        return
    }

    // Número simples para identificar o pedido. Ele não é salvo em banco de dados.
    const numeroPedido = `#${Math.floor(100 + Math.random() * 900)}`

    // Pega o que a pessoa digitou no formulário.
    const dadosCliente = {
        nome: document.getElementById('cliente-nome').value,
        turma: document.getElementById('cliente-turma').value,
        turno: document.getElementById('cliente-turno').value,
        pagamento: document.getElementById('cliente-pagamento').value,
        obs: document.getElementById('cliente-obs').value || "Nenhuma"
    }

    // Soma o valor de todos os produtos para mostrar o total.
    const totalPedido = itensCarrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0)

    // Transforma os itens em texto para colocar dentro do QR Code.
    let listaItensTexto = ""
    itensCarrinho.forEach(item => {
        listaItensTexto += `- ${item.quantidade}x ${item.nome}\n`
    })

    // A versão da biblioteca usada no projeto não lida bem com acentos e símbolos
    // como "º". Removê-los somente do QR evita o erro "code length overflow".
    const textoCompativelComQr = (texto) => texto
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\x20-\x7E\n]/g, '')

    // Junta todas as informações que serão guardadas dentro do QR Code.
    const dadosDoPedidoTexto = textoCompativelComQr(
        `MyCakes Pedido ${numeroPedido}\n` +
        `Cliente: ${dadosCliente.nome}\n` +
        `Turma: ${dadosCliente.turma}\n` +
        `Itens:\n${listaItensTexto}` +
        `Total: R$ ${totalPedido.toFixed(2).replace('.', ',')}`
    )

    // Limpa um QR antigo, caso a pessoa tenha feito outro pedido sem recarregar a página.
    const containerQrcode = document.getElementById("qrcode-container")
    containerQrcode.innerHTML = ""

    // Esconde o formulário e mostra a área de confirmação.
    formCheckout.style.display = "none"
    modalQrcode.style.display = "block"

    // A biblioteca externa recebe o texto e desenha o QR Code.
    try {
        new QRCode(containerQrcode, {
            text: dadosDoPedidoTexto,
            width: 180,
            height: 180,
            colorDark: "#4A2031", // Cor escura da marca.
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        })
    } catch (erro) {
        console.error("Erro na biblioteca QR Code:", erro)
        containerQrcode.innerHTML = "<p style='color: red;'>Erro ao desenhar o QR Code. Mas o pedido foi gravado! Clique abaixo para enviar no WhatsApp!</p>"
    }

    // Prepara a mensagem que será aberta no WhatsApp quando a pessoa clicar no botão.
    btnWhatsapp.onclick = () => {
        const telefoneLoja = "557988891359" // Número da loja, com DDI e DDD.
        
        let textoMensagem = `🎂 *Novo Pedido MyCakes: ${numeroPedido}*\n\n`
        textoMensagem += `👤 *Cliente:* ${dadosCliente.nome}\n`
        textoMensagem += `🏫 *Turma:* ${dadosCliente.turma} (${dadosCliente.turno})\n`
        textoMensagem += `💵 *Pagamento:* ${dadosCliente.pagamento}\n`
        textoMensagem += `💬 *Obs:* ${dadosCliente.obs}\n\n`
        textoMensagem += `🛒 *Itens:* \n`
        
        itensCarrinho.forEach(item => {
            textoMensagem += `- ${item.quantidade}x ${item.nome} (R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')})\n`
        })

        textoMensagem += `\n💰 *Total Geral:* R$ ${totalPedido.toFixed(2).replace('.', ',')}\n\n`
        textoMensagem += `_Apresentarei meu QR Code gerado no dia para retirar o pedido!_`

        const linkWhatsapp = `https://wa.me/${telefoneLoja}?text=${encodeURIComponent(textoMensagem)}`
        
        // Depois de preparar a mensagem, limpamos o carrinho para não enviar o mesmo pedido de novo.
        // 1. Esvazia a lista que está na memória.
        itensCarrinho = []
        // 2. Limpa o navegador para não recuperar itens antigos.
        localStorage.removeItem('mycakes_carrinho')
        // 3. Atualiza a tela e esconde o contador, pois o carrinho ficou vazio.
        renderizarCarrinho()

        // 4. Abre o WhatsApp em outra aba.
        window.open(linkWhatsapp, '_blank')
        
        // 5. Deixa tudo pronto para um próximo pedido.
        formCheckout.style.display = "block"
        modalQrcode.style.display = "none"
        formCheckout.reset()
        fecharCarrinho()
    }
})
