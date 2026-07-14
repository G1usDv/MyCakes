const btnAbrir = document.querySelector('.btn-carrinho')
const fechar = document.querySelector('.fechar')
const overlay = document.querySelector('.overlay')
const carrinho = document.querySelector('.carrinho')

// Seletores novos para o sistema do carrinho
const containerItens = document.querySelector('.itens-carrinho')
const totalElemento = document.getElementById('valor-total')
const formCheckout = document.getElementById('form-checkout')
const modalQrcode = document.getElementById('modal-qrcode')
const qrcodeContainer = document.getElementById('qrcode-container')
const btnWhatsapp = document.getElementById('btn-whatsapp')

// Estado da Aplicação (Memória temporária do app)
let itensCarrinho = JSON.parse(localStorage.getItem('mycakes_carrinho')) || []

function abrirCarrinho(){
    overlay.classList.add('ativo')
    carrinho.classList.add('ativo')
}

function fecharCarrinho(){
    carrinho.classList.remove('ativo')
    overlay.classList.remove('ativo')
}

btnAbrir.addEventListener('click', abrirCarrinho)
fechar.addEventListener('click', fecharCarrinho)
overlay.addEventListener('click', fecharCarrinho)

// 1. ADICIONAR ITEM AO CARRINHO
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

// 2. SALVAR E ATUALIZAR INTERFACE
function salvarAtualizar() {
    localStorage.setItem('mycakes_carrinho', JSON.stringify(itensCarrinho))
    renderizarCarrinho()
}

// 3. RENDERIZAR ITENS NA TELA
function renderizarCarrinho() {
    containerItens.innerHTML = ""

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
        // Estilo inline básico para encaixar no seu layout
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

// 4. MUDAR QUANTIDADE DOS ITENS (Declarada globalmente para os onclick do template literal funcionar)
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

// Executa renderização ao carregar a página para recuperar dados salvos
renderizarCarrinho()

// 5. CRIAÇÃO E FINALIZAÇÃO DO PEDIDO (Método adaptado do vídeo)
formCheckout.addEventListener('submit', (e) => {
    e.preventDefault()

    if (itensCarrinho.length === 0) {
        alert("Adicione pelo menos um bolo ao carrinho antes de finalizar!")
        return
    }

    // Gerando ID sequencial simples
    const numeroPedido = `#${Math.floor(100 + Math.random() * 900)}`

    // Coleta dados do formulário
    const dadosCliente = {
        nome: document.getElementById('cliente-nome').value,
        turma: document.getElementById('cliente-turma').value,
        turno: document.getElementById('cliente-turno').value,
        pagamento: document.getElementById('cliente-pagamento').value,
        obs: document.getElementById('cliente-obs').value || "Nenhuma"
    }

    // Calcula valor total final
    const totalPedido = itensCarrinho.reduce((acc, item) => acc + (item.preco * item.quantidade), 0)

    // Estruturação dos dados simplificados em string de texto para caber perfeitamente no QR Code
    const dadosDoPedidoTexto = `MyCakes Pedido ${numeroPedido}\nCliente: ${dadosCliente.nome}\nTurma: ${dadosCliente.turma}\nTotal: R$ ${totalPedido.toFixed(2).replace('.', ',')}`

    // 1. Limpa o container onde o QR code vai ser desenhado
    const containerQrcode = document.getElementById("qrcode-container")
    containerQrcode.innerHTML = ""

    // 2. Alterna as visualizações na tela
    formCheckout.style.display = "none"
    modalQrcode.style.display = "block"

    // 3. GERAÇÃO DO QR CODE (Sintaxe oficial do vídeo)
    try {
        new QRCode(containerQrcode, {
            text: dadosDoPedidoTexto,
            width: 180,
            height: 180,
            colorDark: "#4A2031", // Cor dark berry do MyCakes
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        })
    } catch (erro) {
        console.error("Erro na biblioteca QR Code:", erro)
        containerQrcode.innerHTML = "<p style='color: red;'>Erro ao desenhar o QR Code. Mas o pedido foi gravado! Clique abaixo para enviar no WhatsApp!</p>"
    }

    // Configuração do botão do WhatsApp
    btnWhatsapp.onclick = () => {
        const telefoneLoja = "557988891359" // NUMERO DE WHATS
        
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
        
        // Limpar carrinho e fechar modal
        itensCarrinho = []
        localStorage.removeItem('mycakes_carrinho')
        renderizarCarrinho()

        window.open(linkWhatsapp, '_blank')
        
        // Reseta o fluxo do formulário
        formCheckout.style.display = "block"
        modalQrcode.style.display = "none"
        formCheckout.reset()
        fecharCarrinho()
    }
})