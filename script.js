// ============================
// CONSTANTES
// ============================
const FRAIS_LIVRAISON = 2000; // frais de livraison par défaut
const SEUIL_REDUCTION = 50000; // seuil pour réduction
const TAUX_REDUCTION = 0.1; // 10% de réduction
const SEUIL_LIVRAISON_GRATUITE = 30000; // seuil pour livraison gratuite

// ============================
// INITIALISATION DU PANIER GLOBAL
// ============================
let panier = JSON.parse(sessionStorage.getItem("panier")) || {};
sessionStorage.setItem("panier", JSON.stringify(panier));

// ============================
// METTRE À JOUR PANIER
// ============================
function mettreAJourPanier() {
  const liste = document.getElementById("liste-panier");
  const compteur = document.getElementById("compteur");
  const totalGeneralEl = document.getElementById("total-general");
  if (!liste || !compteur || !totalGeneralEl) return;

  liste.innerHTML = "";
  let totalGeneral = 0;

  Object.keys(panier).forEach((id) => {
    const produit = panier[id];
    if (!produit) return;

    const nom = produit.nom;
    const quantite = produit.quantite;
    const prix = produit.prix;
    const sousTotal = quantite * prix;
    totalGeneral += sousTotal;

    liste.innerHTML += `
            <div class="ligne-panier">
                <span>${nom}</span>
                <span>${quantite} m</span>
                <span>${sousTotal} FCFA</span>
                <button onclick="supprimerArticle('${id}')">❌</button>
            </div>
        `;
  });

  // Calcul réduction
  const reduction =
    totalGeneral >= SEUIL_REDUCTION ? totalGeneral * TAUX_REDUCTION : 0;
  const sousTotalApresReduction = totalGeneral - reduction;

  // Frais de livraison
  const fraisLivraison =
    totalGeneral >= SEUIL_LIVRAISON_GRATUITE ? 0 : FRAIS_LIVRAISON;
  const totalFinal = sousTotalApresReduction + fraisLivraison;

  totalGeneralEl.innerHTML = `
        Sous-total : ${totalGeneral} FCFA <br>
        ${reduction > 0 ? `<span class="reduction">Réduction (10%) : -${reduction} FCFA</span><br>` : ""}
        Livraison : ${fraisLivraison > 0 ? `${fraisLivraison} FCFA` : `<span class="gratuit">GRATUITE 🎉</span>`} <br>
        <strong>Total : ${totalFinal} FCFA</strong>
    `;

  compteur.innerText = Object.values(panier).reduce(
    (acc, p) => acc + p.quantite,
    0,
  );
}

// ============================
// SUPPRIMER / VIDER PANIER
// ============================
function supprimerArticle(id) {
  delete panier[id];
  sessionStorage.setItem("panier", JSON.stringify(panier));
  mettreAJourPanier();
}

function viderPanier() {
  panier = {};
  sessionStorage.removeItem("panier");
  mettreAJourPanier();
}

// ============================
// INITIALISER PRODUITS SUR LA PAGE
// ============================
function initialiserQuantites() {
  document.querySelectorAll(".product").forEach((item) => {
    const id = item.dataset.id;
    const span = item.querySelector(".number");

    // Initialisation quantité depuis panier global, par défaut 0
    span.innerText = panier[id] ? panier[id].quantite : 0;

    // Bouton Plus
    item.querySelector(".plus").addEventListener("click", () => {
      let val = parseInt(span.innerText) || 0; // part bien de 0
      val += 1;
      span.innerText = val;
      panier[id] = {
        nom: item.querySelector(".product-name").innerText,
        prix: parseFloat(item.dataset.price),
        quantite: val,
      };
      sessionStorage.setItem("panier", JSON.stringify(panier));
      mettreAJourPanier();
    });

    // Bouton Minus
    item.querySelector(".minus").addEventListener("click", () => {
      let val = parseInt(span.innerText) || 0;
      if (val > 0) {
        // ne descend jamais en dessous de 0
        val -= 1;
        span.innerText = val;
        panier[id] = {
          nom: item.querySelector(".product-name").innerText,
          prix: parseFloat(item.dataset.price),
          quantite: val,
        };
        sessionStorage.setItem("panier", JSON.stringify(panier));
        mettreAJourPanier();
      }
    });

    // Ajouter au panier
    item.querySelector(".add-to-cart").addEventListener("click", () => {
      let val = parseInt(span.innerText) || 0;
      panier[id] = {
        nom: item.querySelector(".product-name").innerText,
        prix: parseFloat(item.dataset.price),
        quantite: val,
      };
      sessionStorage.setItem("panier", JSON.stringify(panier));
      mettreAJourPanier();
      alert("Ajouté au panier !");
    });
  });
}

// ============================
// ENVOYER SUR WHATSAPP
// ============================
function envoyerWhatsApp() {
  let message = "🛍️ *COMMANDE RYNEL'SHOP* %0A%0A";
  let totalGeneral = 0;

  for (const id in panier) {
    const produit = panier[id];
    if (!produit) continue;

    const nom = produit.nom;
    const quantite = produit.quantite;
    const prix = produit.prix;
    const sousTotal = quantite * prix;
    totalGeneral += sousTotal;

    message += `• *${nom}*%0A`;
    message += `   ${quantite} m x ${prix} FCFA = ${sousTotal} FCFA%0A%0A`;
  }

  const reduction =
    totalGeneral >= SEUIL_REDUCTION ? totalGeneral * TAUX_REDUCTION : 0;
  const sousTotalApresReduction = totalGeneral - reduction;
  const fraisLivraison =
    totalGeneral >= SEUIL_LIVRAISON_GRATUITE ? 0 : FRAIS_LIVRAISON;
  const totalFinal = sousTotalApresReduction + fraisLivraison;

  message += "----------------------------%0A";
  message += `Sous-total : ${totalGeneral} FCFA%0A`;
  if (reduction > 0) {
    message += `Réduction (10%) : -${reduction} FCFA%0A`;
  }
  message += `Livraison : ${fraisLivraison > 0 ? `${fraisLivraison} FCFA` : "GRATUITE 🎉"}%0A`;
  message += `*TOTAL : ${totalFinal} FCFA*%0A%0A`;
  message += "Merci 🙏";

  const numero = "33758344875"; // ton numéro WhatsApp
  const url = `https://wa.me/${numero}?text=${message}`;
  window.open(url, "_blank");
}

// ============================
// PANIER UI
// ============================
function togglePanier() {
  document.getElementById("panier").classList.toggle("active");
}

function fermerPanier() {
  document.getElementById("panier").classList.remove("active");
}

// ============================
// INITIALISATION
// ============================
initialiserQuantites();
mettreAJourPanier();

// =============================
// EFFET SIGNATURE
// =============================

const text = "Elegance - Raffinement - Qualité";
let index = 0;
const speed = 100;

function typeWriter() {
  if (index < text.length) {
    document.getElementById("typing-text").innerHTML += text.charAt(index);
    index++;
    setTimeout(typeWriter, speed);
  }
}

window.addEventListener("load", typeWriter);

// =============================
//avant que le site apparaisse
// =============================

window.addEventListener("load", function () {
  document.getElementById("preloader").style.display = "none";
});
