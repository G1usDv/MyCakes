const btnAbrir = document.querySelector('.btn-carrinho')
const fechar = document.querySelector('.fechar')
const overlay = document.querySelector('.overlay')
const carrinho = document.querySelector('.carrinho')

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