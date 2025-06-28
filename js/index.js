let debounceTimer;
window.addEventListener("DOMContentLoaded", () => {
  const savedData = localStorage.getItem("lastWeather");
  if (savedData) {
    updateWeatherCards(JSON.parse(savedData));
  }
});

document.getElementById("search").addEventListener("input", function () {
  const location = this.value.trim();
  clearTimeout(debounceTimer);

  if (location.length >= 2) {
    debounceTimer = setTimeout(() => {
      getWeather(location);
    }, 500);
  }
});

document.getElementById("search").addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();
    const location = this.value.trim();
    if (location !== "") {
      getWeather(location);
    }
  }
});

document.getElementById("submit").addEventListener("click", function () {
  const location = document.getElementById("search").value.trim();
  if (location !== "") {
    getWeather(location);
  }
});

async function getWeather(location) {
  const apiKey = "b3d73a59cb9a43f59a0133507252706";
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=3`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Location not found");

    const data = await response.json();
    updateWeatherCards(data);
    localStorage.setItem("lastWeather", JSON.stringify(data));
  } catch (error) {
    console.error(error.message);
  }
}

function updateWeatherCards(data) {
  const cards = document.querySelectorAll(".card");
  const forecastDays = data.forecast.forecastday;
  const locationName = data.location.name;

  forecastDays.forEach((day, i) => {
    const card = cards[i];
    const date = new Date(day.date);
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });
    const formattedDate = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });

    const footer = card.querySelector(".card-footer");

    if (i === 0) {
      footer.innerHTML = `
        <small class="day-name">${weekday}</small>
        <small class="day-date">${formattedDate}</small>`;
      footer.classList.add("d-flex", "justify-content-between");

      const mainIcon = data.current.condition.icon;

      card.querySelector(".city-name").textContent = locationName;
      card.querySelector("#main-temp").textContent = `${day.day.avgtemp_c}°C`;
      card.querySelector("#main-icon").src = `https:${mainIcon}`;
      card.querySelector("#main-icon").alt = data.current.condition.text;

      const tempContainer = card.querySelector("#main-temp").parentElement;
      tempContainer.classList.add("d-flex", "flex-column", "align-items-start");

      card.querySelector(".condition-text").textContent = day.day.condition.text;
      card.querySelector("#rain").textContent = `${day.day.daily_chance_of_rain}%`;
      card.querySelector("#wind").textContent = `${day.day.maxwind_kph} km/h`;
      card.querySelector("#direction").textContent = day.hour[12].wind_dir;
    } else {
      footer.innerHTML = `<small class="day-name">${weekday}</small>`;
      footer.classList.remove("d-flex", "justify-content-between");

      card.querySelector(".forecast-icon").src = `https:${day.day.condition.icon}`;
      card.querySelector(".max-temp").textContent = `${day.day.maxtemp_c}°C`;
      card.querySelector(".min-temp").textContent = `${day.day.mintemp_c}°C`;
      card.querySelector(".condition-text").textContent = day.day.condition.text;
    }
  });
}
