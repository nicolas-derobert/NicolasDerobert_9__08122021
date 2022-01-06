import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBilledIcon from '../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../constants/routes.js'
import USERS_TEST from '../constants/usersTest.js'
import Logout from "./Logout.js"

export const filteredBills = (data, status) => {
  return (data && data.length) ?
    data.filter(bill => {
      let selectCondition

      // in jest environment
      if (typeof jest !== 'undefined') {
        selectCondition = (bill.status === status)
      } else {
        // in prod environment
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        selectCondition =
          (bill.status === status) &&
          ![...USERS_TEST, userEmail].includes(bill.email)
      }

      return selectCondition
    }) : []
}

export const card = (bill) => {
  const firstAndLastNames = bill.email.split('@')[0]
  const firstName = firstAndLastNames.includes('.') ?
    firstAndLastNames.split('.')[0] : ''
  const lastName = firstAndLastNames.includes('.') ?
  firstAndLastNames.split('.')[1] : firstAndLastNames

  return (`
    <div class='bill-card' id='open-bill${bill.id}' data-testid='open-bill${bill.id}'>
      <div class='bill-card-name-container'>
        <div class='bill-card-name'> ${firstName} ${lastName} </div>
        <span class='bill-card-grey'> ... </span>
      </div>
      <div class='name-price-container'>
        <span> ${bill.name} </span>
        <span> ${bill.amount} € </span>
      </div>
      <div class='date-type-container'>
        <span> ${formatDate(bill.date)} </span>
        <span> ${bill.type} </span>
      </div>
    </div>
  `)
}

export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : ""
}

export const getStatus = (index) => {
  switch (index) {
    case 1:
      return "pending"
    case 2:
      return "accepted"
    case 3:
      return "refused"
  }
}

export default class {
  constructor({ document, onNavigate, store, bills, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    $('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1))
    $('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2))
    $('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3))
    this.getBillsAllUsers()
    new Logout({ localStorage, onNavigate })
  }

  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url")
    const imgWidth = Math.floor($('#modaleFileAdmin1').width() * 0.8)
    $('#modaleFileAdmin1').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} /></div>`)
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show')
  }

  handleEditTicket(e, bill, bills) {
    //Regarde le compteur et vérifie si il a déja été initialisé, regarde si lélément cliqué est nouveau, si il est nouveau alors le compteur est réinitialisé
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0 
   // Applique counter a 0 si pas d'id de definis
    //AFF1 : this.counter === 1 et this.id === undefined bill.id===xxxx => this.counter = 0  REINITIALISATION de this.counter
    //AFF2 : this.counter === 1 et this.id === "xAntdtPjo8zA42m5WhWcXR" bill.id==="dMFWAp6UpHzNEqhK3aih29" => this.counter = 0  REINITIALISATION de this.counter
    //AFF2bis : this.counter === 1 et this.id === ""dMFWAp6UpHzNEqhK3aih29"" bill.id===""dMFWAp6UpHzNEqhK3aih29"" => this.counter reste 1  

    // Si c'est un nouveau alors le nouvel id est utilisé
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id 
    // Affecte la facture au gestionnaire de ticket 
    //AFF1 : this.id === undefined et bill.id === "xAntdtPjo8zA42m5WhWcXR") => this.id = bill.id THIS.ID prend la valeur clickée
    //AFF2 : this.id === "xAntdtPjo8zA42m5WhWcXR" et bill.id === ""dMFWAp6UpHzNEqhK3aih29"") => this.id = bill.id == dMFWAp6UpHzNEqhK3aih29 donc THIS.ID prend la valeur clickée
    //AFF2bis : this.id === "dMFWAp6UpHzNEqhK3aih29" et bill.id === ""dMFWAp6UpHzNEqhK3aih29"") => this.id ne change pas

// Si c'est une nouvelle facture qui est sélectionnée alors le processus d'affichage est lancé.
     if (this.counter % 2 === 0) {
      //AFF1 : Au premier passage le résultat est 0
      //AFF2 : Au premier passage le résultat est 0

      // Au second passage le résultat est 0
      bills.forEach(b => {
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
      })//Affecte une couleur aux factures
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' })//Affecte une couleur 
      $('.dashboard-right-container div').html(DashboardFormUI(bill)) //rempli le container
      $('.vertical-navbar').css({ height: '150vh' })
      this.counter ++ 
//AFF1 : Au premier passage this.counter + 1
//AFF2 : Au second passage this.counter + 1

// Au second passage le résultat est 1
// si ce n'est pas une nouvelle facture celle ci est effacée
    } else {
      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' })

      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon"> ${BigBilledIcon} </div>
      `)
      $('.vertical-navbar').css({ height: '120vh' })
      this.counter ++// Le résultat passe à 1 au premier passage
    }
    $('#icon-eye-d').click(this.handleClickIconEye)
    $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill))
    $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill))
  }

  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleShowTickets(e, bills, index) {
    if (this.counter === undefined || this.index === index) this.counter = 0 
    //AFF1 : this.counter ===  undefined, this.index === undefined et index ==1 => this.counter = 0
    //AFF2 : this.counter ===  1, this.index === 1 et index ==2 => this.counter = 0 -> HYPPOTHESE : remplacer this.index !== index par this.index === index

    if (this.index === undefined || this.index !== index) this.index = index 
    //AFF1 : this.index === undefined, this.index === undefined et index ==1 => this.index = index =1
    //AFF2 : this.index === 1, et index ==2 => this.index = index =2

    // , this.index ===1 et this.index ===1 et index ==2 => this.index = 2
    if (this.counter % 2 === 0) { // TRue
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(0deg)'})
      $(`#status-bills-container${this.index}`)
        .html(cards(filteredBills(bills, getStatus(this.index))))
      this.counter ++
      //AFF1 : this.counter devient 1
      //AFF2 : this.counter devient 1

    } else {
      $(`#arrow-icon${this.index}`).css({ transform: 'rotate(90deg)'})
      $(`#status-bills-container${this.index}`)
        .html("")
      this.counter ++
    }

    bills.forEach(bill => {
      $(`#open-bill${bill.id}`).click((e) => this.handleEditTicket(e, bill, bills))
    })

    return bills

  }

  // not need to cover this function by tests
  getBillsAllUsers = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
        .map(doc => ({
          id: doc.id,
          ...doc,
          date: doc.date,
          status: doc.status
        }))
        return bills
      })
      .catch(console.log)
    }
  }
    
  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
    return this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: bill.id})
      .then(bill => bill)
      .catch(console.log)
    }
  }
}