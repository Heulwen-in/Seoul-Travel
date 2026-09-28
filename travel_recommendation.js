const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#recommendation-search");
const resetButton = document.querySelector("#reset-button");
const resultsContainer = document.querySelector("#recommendation-results");
const hero = document.querySelector(".hero");

let travelData = null;

async function loadTravelData() {
    try {
        const response = await fetch("./travel_recommendation_api.json");

        if (!response.ok) {
            throw new Error(`Unable to load recommendations (${response.status})`);
        }

        travelData = await response.json();
        console.log("Travel recommendation data:", travelData);
    } catch (error) {
        console.error("Failed to fetch travel recommendation data:", error);
    }
}

function getAllRecommendations(data) {
    const cities = data.countries.flatMap((country) =>
        country.cities.map((city) => ({
            ...city,
            category: "city",
            country: country.name
        }))
    );

    return [
        ...cities,
        ...data.temples.map((temple) => ({ ...temple, category: "temple" })),
        ...data.beaches.map((beach) => ({ ...beach, category: "beach" }))
    ];
}

function findRecommendations(query) {
    const normalizedQuery = query.trim().toLowerCase();
    const categoryAliases = {
        beach: "beach",
        beaches: "beach",
        temple: "temple",
        temples: "temple",
        city: "city",
        cities: "city",
        country: "city",
        countries: "city"
    };
    const category = categoryAliases[normalizedQuery];
    const recommendations = getAllRecommendations(travelData);

    if (category) {
        return recommendations
            .filter((place) => place.category === category)
            .slice(0, 2);
    }

    return recommendations.filter((place) =>
        [
            place.name,
            place.country,
            place.category,
            place.description
        ].some((value) => value?.toLowerCase().includes(normalizedQuery))
    );
}

function getLocalTime(placeName) {
    const timeZones = {
        Sydney: "Australia/Sydney",
        Melbourne: "Australia/Melbourne",
        Tokyo: "Asia/Tokyo",
        Kyoto: "Asia/Tokyo",
        "Rio de Janeiro": "America/Sao_Paulo",
        "São Paulo": "America/Sao_Paulo",
        "Angkor Wat": "Asia/Phnom_Penh",
        "Taj Mahal": "Asia/Kolkata",
        "Bora Bora": "Pacific/Tahiti",
        "Copacabana Beach": "America/Sao_Paulo"
    };
    const destination = Object.keys(timeZones).find((name) =>
        placeName.includes(name)
    );

    if (!destination) {
        return null;
    }

    const time = new Date().toLocaleTimeString("en-US", {
        timeZone: timeZones[destination],
        hour12: true,
        hour: "numeric",
        minute: "numeric",
        second: "numeric"
    });

    console.log(`Current time in ${destination}:`, time);
    return time;
}

function renderRecommendations(recommendations) {
    resultsContainer.replaceChildren();
    hero.classList.add("showing-results");

    const resultsHeading = document.createElement("h2");
    resultsHeading.className = "results-heading";
    resultsHeading.textContent = "Search Results";
    resultsContainer.append(resultsHeading);

    if (recommendations.length === 0) {
        const message = document.createElement("p");
        message.className = "results-message";
        message.textContent =
            "No recommendations found. Try a country, city, beach, or temple.";
        resultsContainer.append(message);
        return;
    }

    recommendations.forEach((place) => {
        const card = document.createElement("article");
        card.className = "recommendation-card";

        const image = document.createElement("img");
        image.src = place.imageUrl;
        image.alt = `View of ${place.name}`;
        image.loading = "lazy";

        const content = document.createElement("div");
        content.className = "recommendation-content";

        const heading = document.createElement("h2");
        heading.textContent = place.name;

        const description = document.createElement("p");
        description.textContent = place.description;

        const localTime = document.createElement("p");
        localTime.className = "local-time";
        localTime.textContent = `Current local time: ${getLocalTime(place.name)}`;

        const visitButton = document.createElement("button");
        visitButton.type = "button";
        visitButton.textContent = "Visit";

        content.append(heading, description, localTime, visitButton);
        card.append(image, content);
        resultsContainer.append(card);
    });
}

searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();

    if (!query) {
        renderRecommendations([]);
        return;
    }

    if (!travelData) {
        await loadTravelData();
    }

    if (travelData) {
        renderRecommendations(findRecommendations(query));
    }
});

function clearRecommendations() {
    resultsContainer.replaceChildren();
    hero.classList.remove("showing-results");
    searchForm.reset();
    searchInput.focus();
}

resetButton.addEventListener("click", clearRecommendations);

loadTravelData();
