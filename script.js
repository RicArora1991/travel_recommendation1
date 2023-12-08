const searchBar = document.querySelector("#searchInput");
const results = document.querySelector("#results");
let intervalId;

function searchRecommendations() {
  const query = searchBar.value.trim();

  if (query.length === 0) {
    results.innerHTML =
      "<p class='init'>Please enter a valid search query.</p>";
    return;
  }

  results.innerHTML = "<p class='loading'>Loading...</p>";

  fetchRecommendations(query)
    .then((recommendations) => {
      if (recommendations.length > 0) {
        updateResultsElement(recommendations);
        startUpdatingLocalTimings(recommendations);
      } else {
        results.innerHTML = `<p class='error'>No recommendations found for "${query}".</p>`;
      }
    })
    .catch((error) => {
      console.error("Error fetching recommendations:", error);
      results.innerHTML =
        "<p class='error'>Sorry, something went wrong. Please try again later.</p>";
    });
}

function startUpdatingLocalTimings(recommendations) {
  // Clear previous interval if exists
  clearInterval(intervalId);

  const query = searchBar.value.trim().toLowerCase();
  const timeZone = getTimeZoneFromQuery(query);

  if (timeZone) {
    // Start updating local timings every second
    intervalId = setInterval(() => {
      updateLocalTimingForTimeZone(timeZone);
    }, 1000); // Update every 1 second
  }
}

function getTimeZoneFromQuery(query) {
  // Map each location to its respective time zone
  const timeZoneMap = {
    canada: "America/Toronto",
    usa: "America/New_York",
    australia: "Australia/Sydney",
    india: "Asia/Kolkata",
    japan: "Asia/Tokyo",
  };

  // Check if the query contains any of the time zone keywords
  const matchingTimeZones = Object.keys(timeZoneMap).filter((key) =>
    query.includes(key)
  );

  // Return the time zone if found, otherwise return null
  return matchingTimeZones.length > 0
    ? timeZoneMap[matchingTimeZones[0]]
    : null;
}

function updateLocalTimingForTimeZone(timeZone) {
  // Logic to update local timing for the specified time zone
  const currentTimeElement = results.querySelector("#current-time");
  if (currentTimeElement) {
    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
      timeZone: timeZone,
    });

    // Display the updated time
    currentTimeElement.innerHTML = `Current Local Time (${timeZone}):<strong> ${currentTime} </strong>`;
  }
}

function clearResults() {
  results.innerHTML = "";
  searchBar.value = "";
  clearInterval(intervalId);
}

async function fetchRecommendations(query) {
  const response = await fetch(`https://api.npoint.io/cd964792acb3f11cc512`);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch recommendations. Status: ${response.status}`
    );
  }

  const data = await response.json();

  let recommendations = data;

  if (query) {
    const queryWords = query.toLowerCase().split(" ");

    recommendations = recommendations.filter((recommendation) => {
      const name = recommendation.name.toLowerCase();
      const description = recommendation.description.toLowerCase();

      const nameWords = name.split(" ");
      const descriptionWords = description.split(" ");

      return (
        queryWords.some((word) =>
          nameWords.some((nameWord) => nameWord.includes(word))
        ) ||
        queryWords.some((word) =>
          descriptionWords.some((descWord) => descWord.includes(word))
        )
      );
    });
  }

  return recommendations;
}

function updateResultsElement(recommendations) {
  const recommendationsHTML = recommendations
    .map((recommendation) => {
      const imageUrl = recommendation.imageUrl;
      const name = recommendation.name;
      const description = recommendation.description;
      const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        name
      )}`;

      return `
          <div class="destination__card">
            <img src="${imageUrl}" alt="${name}" />
            <div class="card__content">
              <h4>${name}</h4>
              <p>
              ${description}
              </p>
              <button class="btn"><a href="${mapLink}" target="_blank">Visit </a></button>
            </div>
          </div>
        
        `;
    })
    .join("");

  // Add an element to display the current local time
  const currentTimeElement = `<p id="current-time"></p>`;

  results.innerHTML = `
    ${currentTimeElement}
    <ul>${recommendationsHTML}</ul>
  `;
}

// Initial setup to handle recommendations when the page loads
searchRecommendations();
