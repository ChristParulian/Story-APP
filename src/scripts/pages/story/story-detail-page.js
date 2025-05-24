import StoryMap from "../../utils/map";
import { parseActivePathname } from "../../routes/url-parser";

class StoryDetailPage {
  async render() {
    return `<div id="storyDetailContainer"></div>`;
  }

  async afterRender() {
    const container = document.getElementById("storyDetailContainer");
    const { id } = parseActivePathname();

    container.innerHTML = `<div class="loading-text">Memuat detail cerita...</div>`;

    try {
      const token = localStorage.getItem("access-token");
      const response = await fetch(`https://story-api.dicoding.dev/v1/stories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.error) throw new Error(data.message);

      const story = data.story;
      container.innerHTML = `
        <h1 class="story-detail-title">Cerita oleh ${story.name}</h1>
        <div class="story-detail-card">
          <div class="story-detail-left">
            <img src="${story.photoUrl}" alt="${story.name}" class="story-detail-image" />
          </div>
          <div class="story-detail-right">
            <div class="story-detail-meta">
              <span class="story-detail-date">
                <i class="fas fa-calendar-alt"></i>
                Dibuat pada: ${new Date(story.createdAt).toLocaleString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
              <hr />
            </div>
            <div class="story-detail-desc">${story.description || "-"}</div>
            ${
              story.lat && story.lon
                ? `
              <div class="story-detail-map-title">Lokasi Cerita</div>
              <div class="story-detail-map-wrap">
                <div id="storyDetailMap"></div>
              </div>
              `
                : ""
            }
          </div>
        </div>
      `;

      if (story.lat && story.lon) {
        setTimeout(() => {
          const map = new StoryMap("storyDetailMap");
          map.map.setView([story.lat, story.lon], 13);
          map.clearMarkers();
          L.marker([story.lat, story.lon]).addTo(map.map)
            .bindPopup(`Lokasi cerita oleh ${story.name}`);
        }, 0);
      }
    } catch (err) {
      container.innerHTML = `<div class="error-message">${err.message}</div>`;
    }
  }
}

export default StoryDetailPage;