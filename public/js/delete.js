// public/js/delete.js

function deleteItem({ url, redirectTo }) {
    if (!url) {
      console.error("deleteItem: URL manquante");
      return;
    }
  
    const confirmed = confirm("Êtes-vous sûr de vouloir supprimer cet élément ?");
    if (!confirmed) return;
  
    fetch(url, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.text();
      })
      .then(() => {
        if (redirectTo) {
          window.location.href = redirectTo;
        } else {
          location.reload(); // fallback si pas de redirect donné
        }
      })
      .catch((err) => {
        console.error("Erreur DELETE:", err);
        alert("Une erreur est survenue lors de la suppression.");
      });
  }
  