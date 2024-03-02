document.addEventListener("DOMContentLoaded", () => {
  const richListContainer = document.getElementById("rich-list");
  const updateButton = document.getElementById("update-wealth-btn");
  const searchInput = document.getElementById("search-input");
  const sortCheckbox = document.getElementById("sort-checkbox");
  const sortupCheckbox = document.getElementById("sortupCheckbox");
  const filterRadioButtons = document.querySelectorAll(
    'input[name="filter-radio"]'
  );
  const fontSelect = document.getElementById("font-select");
  const wealthInput = document.getElementById("wealth-input");

  let richData = [];

  updateButton.addEventListener("click", () => {
    fetchRichData();
  });

  searchInput.addEventListener("input", () => {
    filterRichData();
  });

  sortCheckbox.addEventListener("change", () => {
    filterRichData();
  });

  sortupCheckbox.addEventListener("change", () => {
    filterRichData();
  });

  filterRadioButtons.forEach((radioButton) => {
    radioButton.addEventListener("change", () => {
      filterRichData();
    });
  });

  fontSelect.addEventListener("change", () => {
    const selectedFont = fontSelect.value;
    document.body.style.fontFamily = selectedFont;
    richListContainer.style.fontFamily = selectedFont;
    localStorage.setItem("fontStyle", selectedFont);
  });

  //FETCH

  function fetchRichData() {
    const domain = document.getElementById('domain').dataset.domain;

    fetch("http://localhost:3000/rich")
      .then((response) => response.json())
      .then((data) => {
        richData = data;
        filterRichData();
      })
      .catch((error) => {
        console.error("Error fetching rich data:", error);
      });
  }

  //FILTER

  function filterRichData() {
    const searchText = searchInput.value.toLowerCase();
    const sortDescending = sortCheckbox.checked;
    const sortAscending = sortupCheckbox.checked;
    const filterValue = document.querySelector(
      'input[name="filter-radio"]:checked'
    ).value;
    const wealthValue = parseFloat(wealthInput.value) || 0;

    const filteredData = richData.filter((person) => {
      return (
        person.imie.toLowerCase().includes(searchText) &&
        (filterValue === "all" ||
          (filterValue === "above-1m" &&
            parseFloat(person.majatek) > wealthValue))
      );
    });

    let sortedData;
    if (sortDescending) {
      sortedData = filteredData.sort(
        (a, b) => parseFloat(b.majatek) - parseFloat(a.majatek)
      );
    } else if (sortAscending) {
      sortedData = filteredData.sort(
        (a, b) => parseFloat(a.majatek) - parseFloat(b.majatek)
      );
    } else {
      sortedData = filteredData;
    }

    displayRichData(sortedData);
  }

  //SHOWRICH

  function displayRichData(data) {
    richListContainer.innerHTML = "";
    data.forEach((person) => {
      const personCard = document.createElement("div");
      personCard.classList.add("person-card", "fade-in");

      const image = document.createElement("img");
      image.src = person.link_do_zdjecia;
      image.alt = person.imie;
      personCard.appendChild(image);

      const name = document.createElement("h3");
      name.textContent = person.imie;
      personCard.appendChild(name);

      const age = document.createElement("p");
      age.textContent = `Wiek: ${person.wiek}`;
      personCard.appendChild(age);

      const kraj = document.createElement("p");
      kraj.textContent = ` ${person.kraj}`;
      personCard.appendChild(kraj);

      const wealth = document.createElement("p");
      wealth.textContent = `Majątek: ${person.majatek} mln $`;
      personCard.appendChild(wealth);

      personCard.addEventListener("click", () => {
        showModal(person.krotki_opis);
      });

      richListContainer.appendChild(personCard);
    });
  }

  const savedFontStyle = localStorage.getItem("fontStyle");
  if (savedFontStyle) {
    richListContainer.style.fontFamily = savedFontStyle;
    document.body.style.fontFamily = savedFontStyle;
    fontSelect.value = savedFontStyle;
  }

  fetchRichData();
});

//DESCRIPION

function showModal(description) {
  let modal = document.querySelector(".modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.classList.add("modal");

    const modalContent = document.createElement("div");
    modalContent.classList.add("modal-content");

    const closeSpan = document.createElement("span");
    closeSpan.classList.add("close");
    closeSpan.innerHTML = "&times;";
    closeSpan.onclick = function () {
      modal.style.display = "none";
    };

    modalContent.appendChild(closeSpan);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  }

  let descriptionP = modal.querySelector("p");
  if (!descriptionP) {
    descriptionP = document.createElement("p");
    modal.querySelector(".modal-content").appendChild(descriptionP);
  }

  descriptionP.textContent = description;
  modal.style.display = "block";
}

//COINS

fetch("https://api.nbp.pl/api/exchangerates/tables/a/?format=json")
  .then((response) => response.json())
  .then((data) => {
    const rates = data[0].rates;

    const usdRate = rates.find((rate) => rate.code === "USD");
    const eurRate = rates.find((rate) => rate.code === "EUR");
    const cnyRate = rates.find((rate) => rate.code === "CNY");
    const chfRate = rates.find((rate) => rate.code === "CHF");

    document.getElementById("USD").innerText = `${usdRate.mid} PLN`;
    document.getElementById("EUR").innerText = `${eurRate.mid} PLN`;
    document.getElementById("CNY").innerText = `${cnyRate.mid} PLN`;
    document.getElementById("CHF").innerText = `${chfRate.mid} PLN`;
  })
  .catch((error) => console.error("Error fetching data:", error));
