export default async function handler(req, res) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const placeId = process.env.PLACE_ID;

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (!data.result || !data.result.reviews) {
    return res.status(500).json({ error: "Unable to fetch reviews." });
  }

  const reviews = data.result.reviews.map((review) => `
    <div class="review" style="flex: 0 0 33.333%; box-sizing: border-box; padding: 10px;">
      <div style="background: #fff; border: 1px solid #ccc; padding: 15px; border-radius: 8px; height: 100%;">
        <strong>${review.author_name}</strong> (${review.rating}⭐)
        <p style="font-size: 14px;">${review.text}</p>
      </div>
    </div>
  `).join('');

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`
    <html>
    <head>
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          overflow-x: hidden;
        }
        .slider-container {
          position: relative;
          width: 100%;
          overflow: hidden;
          padding: 20px 0;
        }
        .slider-track {
          display: flex;
          transition: transform 0.5s ease;
          width: max-content;
        }
        .arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: #000;
          color: #fff;
          border: none;
          padding: 10px;
          cursor: pointer;
          border-radius: 50%;
          z-index: 10;
        }
        .left-arrow {
          left: 10px;
        }
        .right-arrow {
          right: 10px;
        }
      </style>
    </head>
    <body>
      <div class="slider-container">
        <button class="arrow left-arrow" onclick="moveSlide(-1)">&#8592;</button>
        <div class="slider-track" id="sliderTrack">
          ${reviews}
        </div>
        <button class="arrow right-arrow" onclick="moveSlide(1)">&#8594;</button>
      </div>

      <script>
        let currentSlide = 0;
        const slides = document.querySelectorAll('.review');
        const totalSlides = Math.ceil(slides.length / 3);

        function moveSlide(direction) {
          currentSlide += direction;
          if (currentSlide < 0) currentSlide = 0;
          if (currentSlide >= totalSlides) currentSlide = totalSlides - 1;

          const sliderTrack = document.getElementById('sliderTrack');
          sliderTrack.style.transform = 'translateX(' + (-100 * currentSlide) + '%)';
        }
      </script>
    </body>
    </html>
  `);
}
