import html2canvas from "html2canvas";

/**
 * Export a leaderboard table as a high-quality image
 * @param elementId - The ID of the element to capture
 * @param filename - The filename for the downloaded image
 * @param tournamentName - Tournament name to overlay on the image
 */
export async function exportLeaderboardAsImage(
  elementId: string,
  filename: string = "leaderboard.png",
  tournamentName: string = "Arena Ace Tournament"
): Promise<void> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    // Capture the element as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality (2x resolution)
      useCORS: true, // Allow cross-origin images
      backgroundColor: "#1a1a1a", // Dark background
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    // Add branding overlay
    const ctx = canvas.getContext("2d");
    if (ctx) {
      // Add tournament title at the top
      ctx.font = "bold 48px 'Bebas Neue', Arial, sans-serif";
      ctx.fillStyle = "#FF4646";
      ctx.textAlign = "center";
      ctx.fillText(tournamentName.toUpperCase(), canvas.width / 2, 60);

      // Add timestamp at the bottom
      ctx.font = "24px Arial, sans-serif";
      ctx.fillStyle = "#999999";
      const timestamp = new Date().toLocaleString();
      ctx.fillText(timestamp, canvas.width / 2, canvas.height - 30);
    }

    // Convert canvas to blob
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error("Failed to create image blob");
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, "image/png");
  } catch (error) {
    console.error("Failed to export leaderboard:", error);
    throw error;
  }
}

/**
 * Share leaderboard image via Web Share API or clipboard
 * @param elementId - The ID of the element to capture
 * @param tournamentName - Tournament name for the share text
 */
export async function shareLeaderboardImage(
  elementId: string,
  tournamentName: string = "Arena Ace Tournament"
): Promise<void> {
  const element = document.getElementById(elementId);
  
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#1a1a1a",
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    // Add branding
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.font = "bold 48px 'Bebas Neue', Arial, sans-serif";
      ctx.fillStyle = "#FF4646";
      ctx.textAlign = "center";
      ctx.fillText(tournamentName.toUpperCase(), canvas.width / 2, 60);

      ctx.font = "24px Arial, sans-serif";
      ctx.fillStyle = "#999999";
      const timestamp = new Date().toLocaleString();
      ctx.fillText(timestamp, canvas.width / 2, canvas.height - 30);
    }

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      }, "image/png");
    });

    // Try Web Share API first
    if (navigator.share && navigator.canShare) {
      const file = new File([blob], "leaderboard.png", { type: "image/png" });
      
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `${tournamentName} - Leaderboard`,
          text: `Check out the latest standings from ${tournamentName}!`,
          files: [file],
        });
        return;
      }
    }

    // Fallback: Copy to clipboard
    if (navigator.clipboard && (navigator.clipboard as any).write) {
      const item = new ClipboardItem({ "image/png": blob });
      await (navigator.clipboard as any).write([item]);
      alert("Leaderboard image copied to clipboard! You can paste it anywhere.");
    } else {
      // Last resort: Download the image
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "leaderboard.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert("Leaderboard downloaded! (Share not supported on this browser)");
    }
  } catch (error) {
    console.error("Failed to share leaderboard:", error);
    throw error;
  }
}

/**
 * Get optimal dimensions for social media platforms
 */
export const SOCIAL_MEDIA_DIMENSIONS = {
  instagram: { width: 1080, height: 1080 },
  twitter: { width: 1200, height: 675 },
  facebook: { width: 1200, height: 630 },
  youtube: { width: 1280, height: 720 },
} as const;
