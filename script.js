let map;

function checkRegion() {
  const videoUrl = document.getElementById('video-url').value;
  const videoId = extractVideoId(videoUrl);

  if (!videoId) {
    alert('Invalid YouTube video URL');
    return;
  }

  // Replace 'YOUR_API_KEY' with your actual API key
  const apiKey = 'AIzaSyCqHDIvG7eSEGrCvJt93c68tKtMJ0SFaYU';

  // Load the YouTube API client library
  gapi.load('client', () => {
    gapi.client.init({
      apiKey: apiKey,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
    }).then(() => {
      // Get video information using the YouTube Data API
      return gapi.client.youtube.videos.list({
        part: 'snippet,contentDetails,statistics',
        id: videoId,
      });
    }).then(response => {
      const videoInfo = response.result.items[0];
      
      updateMap(videoInfo);
      updateCountryList(videoInfo);
      updateVideoDetails(videoInfo);
    }).catch(error => {
      console.error('Error fetching data:', error);
      alert('Error fetching data. Please try again.');
    });
  });
}

function extractVideoId(videoUrl) {
  const match = videoUrl.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function updateMap(videoInfo) {
  const mapContainer = document.getElementById('map');
  // Clear the previous content in the map container
  mapContainer.innerHTML = '';

  // Create a new map only if it's not already created
  if (!map) {
    map = L.map('map').setView([0, 0], 2); // Set initial view to a default location

    // Add a tile layer to the map (you can choose different tile providers)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
  }

  // Set markers on the map based on the video information
  const latitude = parseFloat(videoInfo.snippet.location?.latitude);
  const longitude = parseFloat(videoInfo.snippet.location?.longitude);

  if (!isNaN(latitude) && !isNaN(longitude)) {
    L.marker([latitude, longitude]).addTo(map)
      .bindPopup(videoInfo.snippet.title)
      .openPopup();
  } else {
    mapContainer.innerHTML = '<p>Location information not available for this video.</p>';
  }
}

function updateCountryList(videoInfo) {
  const countryListContainer = document.getElementById('country-list');
  countryListContainer.innerHTML = '<h2>Restricted Countries</h2>';
  
  const restrictedCountries = videoInfo.contentDetails.regionRestriction?.blocked || [];

  if (restrictedCountries.length > 0) {
    const ul = document.createElement('ul');
    restrictedCountries.forEach(country => {
      const li = document.createElement('li');
      li.textContent = country;
      ul.appendChild(li);
    });
    countryListContainer.appendChild(ul);
  } else {
    countryListContainer.innerHTML += '<p>No restrictions in any country.</p>';
  }
}

function updateVideoDetails(videoInfo) {
  const videoDetailsContainer = document.getElementById('video-details');
  videoDetailsContainer.innerHTML = `
    <h2>Video Details</h2>
    <p class="title">Title: ${videoInfo.snippet.title}</p>
    <p class="uploader">Uploader: ${videoInfo.snippet.channelTitle}</p>
    <p class="views">Views: ${videoInfo.statistics.viewCount}</p>
    <p class="upload-date">Upload Date: ${videoInfo.snippet.publishedAt}</p>
    <img src="${videoInfo.snippet.thumbnails.default.url}" alt="Video Thumbnail">
    <p class="description">Description: ${videoInfo.snippet.description}</p>
  `;
}
