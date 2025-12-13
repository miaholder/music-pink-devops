const API_BASE = "https://api.music-pink-api.workers.dev";

// Public music API (no auth required)
function searchMusic() {
  const term = document.getElementById("searchTerm").value;
  fetch(`https://itunes.apple.com/search?term=${term}&limit=5`)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("results");
      list.innerHTML = "";
      data.results.forEach(track => {
        const li = document.createElement("li");
        li.textContent = `${track.artistName} - ${track.trackName}`;
        list.appendChild(li);
      });
    });
}

// Your backend API
function createUser() {
  const username = document.getElementById("username").value;
  fetch(`${API_BASE}/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("status").textContent =
        "User created: " + data.username;
    });
}

