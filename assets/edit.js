function dodaj() {
  const formData = new FormData(document.getElementById("dataForm"));
  fetch(`${domain}/edit/add`, {
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
    alert("EMPTY ID");
    return;
  }

  const filteredData = Object.fromEntries(
    Array.from(formData).filter(([key, value]) => value !== "" && key !== "id")
  );

  fetch(`${domain}/edit/update/${id}`, {
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
  const id = document.getElementById("idd").value;
  if (!id) {
    alert("EMPTY ID");
    return;
  }
  fetch(`${domain}/edit/delete/${id}`, {
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
  fetch(`${domain}/rich`)
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
  const searchInput = document.createElement("input");
  searchInput.setAttribute("type", "text");
  searchInput.setAttribute("placeholder", "Name search...");
  richListContainer.appendChild(searchInput);
  searchInput.addEventListener("input", function () {
    const searchValue = searchInput.value.toLowerCase();
    data.forEach((person) => {
      const personCard = document.getElementById(`person-${person.id}`);
      if (person.imie.toLowerCase().includes(searchValue)) {
        personCard.style.display = "block";
      } else {
        personCard.style.display = "none";
      }
    });
  });

  data.forEach((person) => {
    const personCard = document.createElement("div");
    personCard.classList.add("person-card", "fade-in");
    personCard.id = `person-${person.id}`;

    const image = document.createElement("img");
    image.src = person.link_do_zdjecia;
    image.alt = person.imie;

    const imie = document.createElement("p");
    imie.textContent = person.imie;

    personCard.appendChild(image);
    personCard.appendChild(imie);

    const idElement = document.createElement("h3");
    idElement.textContent = person.id;
    personCard.appendChild(idElement);

    richListContainer.appendChild(personCard);
  });
}

document.getElementById("logoutButton").addEventListener("click", function () {
  fetch("/server/logout", {
    method: "GET",
  })
    .then((response) => {
      if (response.redirected) {
        window.location.href = response.url;
      }
    })
    .catch((error) => console.error("Błąd:", error));
});

function edit() {
  const textareaElement = document.getElementById("tresc");
  const opis = document.getElementById("tresc2");
  const zawartoscTextarea = textareaElement.value;
  const zawartoscTextarea2 = opis.value;
  const requestBody = {
    content: zawartoscTextarea,
    content2: zawartoscTextarea2,
  };

  fetch(`${domain}/api/dynamic-content/edit`, {
    method: "PUT",
    body: JSON.stringify(requestBody),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((data) => {
      alert(data);
    })
    .catch((error) => console.error("Error:", error));
}

document.addEventListener("DOMContentLoaded", function () {
  const teamDiv = document.getElementById("posty");

  fetch(`${domain}/all`)
    .then((response) => response.json())
    .then((posts) => {
      posts.forEach((post) => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");
        postDiv.id = `usun-${post.id}`;

        const postContent = `
                      <h4>${post.nick} - ${post.czas} </h4>
                      <p>${post.tresc}</p>
                      <button class="delete-button">DELETE</button>
                  `;

        postDiv.innerHTML = postContent;
        teamDiv.appendChild(postDiv);

        const deleteButton = postDiv.querySelector(".delete-button");
        deleteButton.addEventListener("click", function () {
          const postId = post.id;

          fetch(`${domain}/post/delete/${postId}`, {
            method: "DELETE",
          })
            .then((response) => response.text())
            .then((data) => {
              console.log(data);
              postDiv.remove();
            })
            .catch((error) => {
              console.error("ERROR:", error);
            });
          location.reload();
        });
      });
    })
    .catch((error) => {
      console.error("ERROR:", error);
    });
});
