function dodaj() {
  const formData = new FormData(document.getElementById("dataForm"));
  fetch("http://localhost:3000/edit/add", {
    method: "POST",
    body: JSON.stringify(Object.fromEntries(formData)),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((data) => alert(data))
    .catch((error) => console.error("Error:", error));
  location.reload();
}

function edytuj() {
  const formData = new FormData(document.getElementById("dataForm"));
  const id = formData.get("id");

  if (!id) {
    alert("ID jest wymagane do edycji");
    return;
  }

  const filteredData = Object.fromEntries(
    Array.from(formData).filter(([key, value]) => value !== "" && key !== "id")
  );

  fetch(`http://localhost:3000/edit/update/${id}`, {
    method: "PUT",
    body: JSON.stringify(filteredData),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((data) => {
      alert(data);
      location.reload(); 
    })
    .catch((error) => console.error("Error:", error));
  location.reload();
}

function usun() {
  const id = document.getElementById("id").value;
  if (!id) {
    alert("ID jest wymagane do usunięcia");
    return;
  }
  fetch(`http://localhost:3000/edit/delete/${id}`, {
    method: "DELETE",
  })
    .then((response) => response.text())
    .then((data) => alert(data))
    .catch((error) => console.error("Error:", error));
  location.reload();
}

const richListContainer = document.getElementById("rich-list");

window.addEventListener("load", (event) => {
  fetchRichData();
});

function fetchRichData() {
  fetch("http://localhost:3000/rich")
    .then((response) => response.json())
    .then((data) => {
      displayRichData(data);
    })
    .catch((error) => {
      console.error("Error fetching rich data:", error);
    });
}

function displayRichData(data) {
  richListContainer.innerHTML = "";

  data.forEach((person) => {
    const personCard = document.createElement("div");
    personCard.classList.add("person-card", "fade-in");

    const image = document.createElement("img");
    image.src = person.link_do_zdjecia;
    image.alt = person.imie;
    personCard.appendChild(image);

    const idElement = document.createElement("h3");
    idElement.textContent = person.id;
    personCard.appendChild(idElement);

    richListContainer.appendChild(personCard);
  });
}

document.getElementById('logoutButton').addEventListener('click', function() {
  fetch('/logout', {
      method: 'GET',
  })
  .then(response => {
      if(response.redirected) {
          window.location.href = response.url; 
      }
  })
  .catch(error => console.error('Błąd:', error));
});
