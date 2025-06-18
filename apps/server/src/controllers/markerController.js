import sharp from "sharp";

const getMarkers = async (req, res) => {
    const color = req.query.color;
    const logoURL = req.query.logoURL;
    const svg = !logoURL
        ? `
          <svg
          width="36"
          height="48"
          viewBox="0 0 120 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main circle */}
          <circle cx="60" cy="60" r="50" fill="#${color}" stroke="#${color}" strokeWidth="10" />

          {/* Pin point - downward facing triangle with flat edge at top */}
          <path d="M30 100 L90 100 L60 150 Z" fill="#${color}" />

          {/* Inner white circle */}
          <circle cx="60" cy="60" r="45" fill="white" />
        </svg>
        `
        : `
        <svg
          width="36"
          height="48"
          viewBox="0 0 120 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main circle */}
          <circle cx="60" cy="60" r="50" fill="#${color}" stroke="#${color}" strokeWidth="10" />

          {/* Pin point - downward facing triangle with flat edge at top */}
          <path d="M30 100 L90 100 L60 150 Z" fill="#${color}" />

          {/* Inner white circle */}
          <circle cx="60" cy="60" r="45" fill="white" />

          {/* logo inside the circle - centered */}
          <image
            href="${logoURL}"
            x="15"
            y=""
            width="75%"
            height="75%"
            preserveAspectRatio="xMidYMid meet"
          />
        </svg>
        `;
    const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
    res.setHeader("Content-Type", "image/png");
    res.send(pngBuffer);
};

export { getMarkers };
