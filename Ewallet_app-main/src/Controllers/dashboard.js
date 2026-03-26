import {getbeneficiaries ,finduserbyaccount,findbeneficiarieByid} from "../Model/database.js";
const user = JSON.parse(sessionStorage.getItem("currentUser"));
// DOM elements
const greetingName = document.getElementById("greetingName");
const currentDate = document.getElementById("currentDate");
const solde = document.getElementById("availableBalance");
const incomeElement = document.getElementById("monthlyIncome");
const expensesElement = document.getElementById("monthlyExpenses");
const activecards = document.getElementById("activeCards");
const transactionsList = document.getElementById("recentTransactionsList");
const transferBtn = document.getElementById("quickTransfer");
const transferSection = document.getElementById("transferPopup");
const closeTransferBtn = document.getElementById("closeTransferBtn");
const cancelTransferBtn = document.getElementById("cancelTransferBtn");

//modification ici pour le recharge
const rechargeBtn = document.getElementById("quickTopup");
const rechargeSection = document.getElementById("rechargePopup");
const closeRechargeBtn = document.getElementById("closeRechargeBtn");
const cancelRechargeBtn = document.getElementById("cancelRechargeBtn");


const beneficiarySelect = document.getElementById("beneficiary");
const sourceCard = document.getElementById("sourceCard");
const sourceCard2 = document.getElementById("sourceCard2");

const submitTransferBtn=document.getElementById("submitTransferBtn");
const submitRechargeBtn=document.getElementById("submitRechargeBtn");

// Guard
if (!user) {
  alert("User not authenticated");
  window.location.href = "/index.html";
}

// Events
  transferBtn.addEventListener("click", handleTransfersection);
  closeTransferBtn.addEventListener("click", closeTransfer);
  cancelTransferBtn.addEventListener("click", closeTransfer);
  submitTransferBtn.addEventListener("click",handleTransfer);
  submitRechargeBtn.addEventListener("click",handleRecharge);

  rechargeBtn.addEventListener("click", handlerRechargeSection);
  cancelRechargeBtn.addEventListener("click", closeRecharge);
  closeRechargeBtn.addEventListener("click", closeRecharge);

  

// Retrieve dashboard data
const getDashboardData = () => {
  const monthlyIncome = user.wallet.transactions
    .filter(t => t.type === "credit")
    .reduce((total, t) => total + t.amount, 0);

  const monthlyExpenses = user.wallet.transactions
    .filter(t => t.type === "debit")
    .reduce((total, t) => total + t.amount, 0);

  return {
    userName: user.name,
    currentDate: new Date().toLocaleDateString("fr-FR"),
    availableBalance: `${user.wallet.balance} ${user.wallet.currency}`,
    activeCards: user.wallet.cards.length,
    monthlyIncome: `${monthlyIncome} MAD`,
    monthlyExpenses: `${monthlyExpenses} MAD`,
  };
};

function renderDashboard(){
const dashboardData = getDashboardData();
if (dashboardData) {
  greetingName.textContent = dashboardData.userName;
  currentDate.textContent = dashboardData.currentDate;
  solde.textContent = dashboardData.availableBalance;
  incomeElement.textContent = dashboardData.monthlyIncome;
  expensesElement.textContent = dashboardData.monthlyExpenses;
  activecards.textContent = dashboardData.activeCards;
}
// Display transactions
transactionsList.innerHTML = "";
user.wallet.transactions.forEach(transaction => {
  const transactionItem = document.createElement("div");
  transactionItem.className = "transaction-item";
  transactionItem.innerHTML = `
    <div>${transaction.date}</div>
    <div>${transaction.amount} MAD</div>
    <div>${transaction.type}</div>
    <div>${transaction.etat}</div>
  `;
  transactionsList.appendChild(transactionItem);
});

}
renderDashboard();

// Transfer popup
function closeTransfer() {
  transferSection.classList.remove("active");
  document.body.classList.remove("popup-open");
}
function closeRecharge() {
  rechargeSection.classList.remove("active");
  document.body.classList.remove("popup-open");
}


function handleTransfersection() {
  transferSection.classList.add("active");
  document.body.classList.add("popup-open");
}


function handlerRechargeSection() {
  rechargeSection.classList.add("active");
  document.body.classList.add("popup-open");
}
// Beneficiaries
const beneficiaries = getbeneficiaries(user.id);

function renderBeneficiaries() {
  beneficiaries.forEach((beneficiary) => {
    const option = document.createElement("option");
    option.value = beneficiary.id;
    option.textContent = beneficiary.name;
    beneficiarySelect.appendChild(option);
  });
}
renderBeneficiaries();
function renderCards() {
  user.wallet.cards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.numcards;
    option.textContent = card.type+"****"+card.numcards;
    sourceCard.appendChild(option);
  });
}



// Affichage des cartes dans le formulaire de recharge
function renderCards2() {
  user.wallet.cards.forEach((card) => {
    const option = document.createElement("option");
    option.value = card.numcards;
    option.textContent = card.type+"****"+card.numcards;
    sourceCard2.appendChild(option);
  });
}
renderCards();
renderCards2();
//###################################  Transfer  #####################################################//

// check function 

/* function checkUser(numcompte, callback) {
  setTimeout(() => {
    const destinataire = finduserbyaccount(numcompte);
    if (destinataire) {
      callback(destinataire);
    } else {
      console.log("Destinataire non trouvé");
    }
  }, 500);
}

function checkSolde(exp, amount, callback) {
  setTimeout(() => {
    const solde = exp.wallet.balance;
    if (solde >= amount) {
      callback("Solde suffisant");
    } else {
      callback("Solde insuffisant");
    }
  }, 400);
}

function updateSolde(exp, destinataire, amount, callback) {
  setTimeout(() => {  
    exp.wallet.balance -= amount;
    destinataire.wallet.balance += amount;
    callback("Solde mis à jour");
  }, 300);
}


function addtransactions(exp, destinataire, amount, callback) {
  setTimeout(() => { 
    // Transaction pour l'expéditeur (débit)
    const transactionDebit = {
      id: Date.now(),
      type: "debit",
      amount: amount,
      from: exp.name,
      to: destinataire.name,
      date: new Date().toLocaleDateString()
    };

    // Transaction pour le destinataire (crédit)
    const transactionCredit = {
      id: Date.now() + 1,
      type: "credit",
      amount: amount,
      from: exp.name,
      to: destinataire.name,
      date: new Date().toLocaleDateString()
    };

    user.wallet.transactions.push(transactionDebit);
    destinataire.wallet.transactions.push(transactionCredit);
    renderDashboard();
    callback("Transaction enregistrée");
  }, 200);
}


export function transferer(exp, numcompte, amount) {
  console.log("\n DÉBUT DU TRANSFERT ");

  // Étape 1: Vérifier le destinataire
  checkUser(numcompte, function afterCheckUser(destinataire) {
    console.log("Étape 1: Destinataire trouvé -", destinataire.name);

    // Étape 2: Vérifier le solde
    checkSolde(exp, amount, function afterCheckSolde(soldemessage) {
      console.log(" Étape 2:", soldemessage);

      if (soldemessage.includes("Solde suffisant")) {
        // Étape 3: Mettre à jour les soldes
        updateSolde(exp, destinataire, amount, function afterUpdateSolde(updatemessage) {
          console.log(" Étape 3:", updatemessage);

          // Étape 4: Enregistrer la transaction
          addtransactions(exp, destinataire, amount, function afterAddTransactions(transactionMessage) {
            console.log(" Étape 4:", transactionMessage);
            console.log(`Transfert de ${amount} réussi!`);
          });
        });
      }
    });
  });
}


function handleTransfer(e) {
 e.preventDefault();
  const beneficiaryId = document.getElementById("beneficiary").value;
  const beneficiaryAccount=findbeneficiarieByid(user.id,beneficiaryId).account;
  const sourceCard = document.getElementById("sourceCard").value;

  const amount = Number(document.getElementById("amount").value);

  
  transferer(user, beneficiaryAccount, amount);

} */






//  Promise (au lieu des callbacks)


// Étape 1 : Vérifier si le destinataire existe
function checkUser(numcompte) {
  const p = new Promise((resolve, reject) => {
    setTimeout(() => {
      const beneficiary = finduserbyaccount(numcompte);
      if (beneficiary) {
        resolve(beneficiary); // succès on passe le destinataire
      } else {
        reject("Destinataire non trouvé"); 
      }
    }, 2000);
  });
  return p;
}

// Étape 2 : Vérifier si le solde est suffisant
function checkSolde(expediteur, amount) {
  const p = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (expediteur.wallet.balance > amount) {
        resolve("Solde suffisant");
      } else {
        reject("Solde insuffisant");
      }
    }, 3000);
  });
  return p;
}

// Étape 3 : Mettre à jour les soldes
function updateSolde(expediteur, destinataire, amount) {
  const p = new Promise((resolve) => {
    setTimeout(() => {
      expediteur.wallet.balance -= amount;
      destinataire.wallet.balance += amount;
      resolve("Solde mis à jour");
    }, 200);
  });
  return p;
}

// Étape 4 : Ajouter les transactions
function addtransactions(expediteur, destinataire, amount) {
  const p = new Promise((resolve) => {
    setTimeout(() => {
      // Transaction débit pour l'expéditeur
      const debit = {
        id: Date.now(),
        type: "debit",
        amount: amount,
        date: new Date().toLocaleDateString(),
        to: destinataire.name,
        etat:"valide",
      };
      // Transaction crédit pour le destinataire
      const credit = {
        id: Date.now() + 1,
        type: "credit",
        amount: amount,
        date: new Date().toLocaleDateString(),
        from: expediteur.name,
        etat:"valide",
      };

      expediteur.wallet.transactions.push(debit);
      destinataire.wallet.transactions.push(credit);
      renderDashboard(); // rafraîchir l'affichage
      resolve("Transaction enregistrée avec succès");
    }, 3000);
  });
  return p;
}




//   Fonction transfer avec .then() 

function transfer(expediteur, numcompte, amount) {
  console.log("Début du transfert");

  checkUser(numcompte)
    .then((destinataire) => {
      console.log("Étape 1 Destinataire trouvé -", destinataire.name);
      return checkSolde(expediteur, amount).then((soldeMessage) => {
          console.log("Étape 2 ", soldeMessage);
          return updateSolde(expediteur, destinataire, amount);
        }).then((updateMessage) => {
          console.log("Étape 3 ", updateMessage);
          return addtransactions(expediteur, destinataire, amount);
        }).then((transactionMessage) => {
          console.log("Étape 4 ", transactionMessage);
          console.log(`Transfert de ${amount} MAD réussi !`);
        });
    })
    .catch((erreur) => {
      alert(erreur); 
    });
}








/*********** recharger *****************************************************************************/

// le montant doit être supérieur à 0 et compris entre 10 et 5000 MAD
function checkmontant(amount) {
  const p = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (amount <= 0) {
        reject("Le montant doit être supérieur à 0");
      } else if (amount < 10 || amount > 5000) {
        reject("Le montant doit être compris entre 10 et 5000 MAD");
      } else if (user.wallet.balance > amount) {
        resolve("montant valide");
      } else {
        reject("montant invalide");
      }
    }, 2000);
  });
  return p;
}



//Une carte expirée ne peut pas être utilisée. 
function checkCardExpiry(numcarte) {
  const p = new Promise((resolve, reject) => {
    setTimeout(() => {
      const card = user.wallet.cards.find(c => c.numcards === numcarte);
      if (card) {
        const today = new Date();
        const expiryDate = new Date(card.expiry);
        if (expiryDate > today) {
          resolve("Carte valide");
        } else {
          reject("Carte expirée");
        } 
      } else {
        reject("Carte non trouvée");
      }
    }, 2000);
  });
  return p;
}
 
//Le solde du wallet est augmenté du montant rechargé updatemantant
function updatemantant(user, amount) {
  const p = new Promise((resolve) => {
    setTimeout(() => {
      user.wallet.balance += amount;
      resolve("Solde mis à jour");
    }, 200);
  });
  return p;
}


function addtransactionrecharge(expediteur, amount) {
const p = new Promise((resolve) => {
    setTimeout(() => {
      const transaction = {
        id: Date.now(),
        type: "Recharge",
        amount: amount,
        date: new Date().toLocaleDateString(),
        from: "Carte " + sourceCard2.value,
        etat:"valid",
      };

      expediteur.wallet.transactions.push(transaction);
      renderDashboard();
      resolve("Transaction de recharge enregistrée");
    }, 2000);
  });
  return p;
}

// en cas d'échec de la recharge 
function addtransactionechec(expediteur, amount) {
  const p = new Promise((resolve) => {
      setTimeout(() => {
        const transaction = {
          id: Date.now(),
          type: "Recharge",
          amount: amount,
          date: new Date().toLocaleDateString(),
          from: "Carte " + sourceCard2.value,
          etat:"echouée",
        };
        expediteur.wallet.transactions.push(transaction);
        renderDashboard();
        resolve("Transaction de recharge échouée enregistrée");
      }
      , 2000);
    return p;
  });
}



function recharge(expediteur, numcarte, amount) {
  console.log("Début de la recharge");
  checkCardExpiry(numcarte)
    .then((cardMessage) => {
      console.log("Étape 1 ", cardMessage);
      return checkmontant(amount).then((montantMessage) => {
          console.log("Étape 2 ", montantMessage)}
      ).then(() => {
          return updatemantant(expediteur, amount);
        }).then((updateMessage) => {
          console.log("Étape 3 ", updateMessage);
          return addtransactionrecharge(expediteur, amount);
        }).then((transactionMessage) => {
          console.log("Étape 4 ", transactionMessage);
          alert(`Recharge de ${amount} MAD réussie !`);
        });
    })
    .catch((erreur) => {
      alert(erreur);
      addtransactionechec(expediteur, amount).then(() => {
        console.log("Transaction de recharge échouée enregistrée");
      });
      
    });
}






function handleRecharge(e) {
  e.preventDefault();
  const sourceCard2 = document.getElementById("sourceCard2").value;
  const amount = Number(document.getElementById("amount2").value);

  recharge(user, sourceCard2, amount);
}


function handleTransfer(e) {
  e.preventDefault();
  const beneficiaryId = document.getElementById("beneficiary").value;
  const beneficiaryAccount = findbeneficiarieByid(user.id, beneficiaryId).account;
  const sourceCard = document.getElementById("sourceCard").value;
  
  const amount = Number(document.getElementById("amount").value);

  transfer(user, beneficiaryAccount, amount);
}

