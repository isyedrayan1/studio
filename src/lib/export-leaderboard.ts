import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

/**
 * Export leaderboard data as a high-quality PDF
 * @param standings - The standings data array
 * @param dayName - Name of the day or "Overall"
 * @param tournamentName - Tournament name for the header
 */
export async function exportLeaderboardAsPDF(
  standings: any[],
  dayName: string = "Overall Standings",
  tournamentName: string = "Arena Ace Tournament",
  getTeamById: (id: string) => any
): Promise<void> {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  // Header Section
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 70, 70); // Theme red
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(tournamentName.toUpperCase(), 105, 18, { align: "center" });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(dayName.toUpperCase(), 105, 28, { align: "center" });
  
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(10);
  doc.text(`Generated on: ${timestamp}`, 105, 35, { align: "center" });

  // Prepare table data
  const tableRows = standings.map((s, idx) => {
    const team = getTeamById(s.teamId);
    return [
      idx + 1,
      team?.name || "Unknown",
      s.matchesPlayed || 0,
      s.totalKills || 0,
      s.totalPlacement || 0,
      s.booyahCount || 0,
      s.totalPoints || 0
    ];
  });

  // Generate Table
  autoTable(doc, {
    startY: 45,
    head: [['#', 'TEAM', 'GP', 'KILLS', 'PLACE PTS', 'BOOYAH', 'TOTAL PTS']],
    body: tableRows,
    theme: 'striped',
    headStyles: { 
      fillColor: [239, 68, 68], // Primary red
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'center', cellWidth: 30 },
      5: { halign: 'center', cellWidth: 25 },
      6: { halign: 'center', fontStyle: 'bold', cellWidth: 30 }
    },
    styles: { 
      fontSize: 9,
      cellPadding: 4,
      valign: 'middle'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    margin: { top: 45 },
    didDrawPage: (data) => {
      // Add page number at bottom
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: "center" }
      );
    }
  });

  // Save the PDF
  const filename = `FFSAL_Leaderboard_${dayName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

/**
 * Export a single match result as PDF
 */
export async function exportMatchAsPDF(
  match: any,
  standings: any[],
  dayName: string,
  tournamentName: string = "Arena Ace Tournament",
  getTeamById: (id: string) => any
): Promise<void> {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();
  const isCS = match.type === 'cs-bracket' || match.name?.toLowerCase().includes('cs');

  // Header
  doc.setFillColor(26, 26, 26);
  doc.rect(0, 0, 210, 40, "F");
  
  doc.setTextColor(255, 70, 70);
  doc.setFontSize(20);
  doc.text(tournamentName.toUpperCase(), 105, 15, { align: "center" });
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(match.name || `Match ${match.matchNumber}`, 105, 25, { align: "center" });
  
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(10);
  doc.text(`${dayName} • Generated: ${timestamp}`, 105, 34, { align: "center" });

  // Table Data
  const head = isCS 
    ? [['RANK', 'TEAM', 'RESULT']]
    : [['RANK', 'TEAM', 'KILLS', 'PLACE PTS', 'TOTAL PTS']];

  const body = standings.map(s => {
    const team = getTeamById(s.teamId);
    if (isCS) {
      return [
        `#${s.placement}`,
        team?.name || "Unknown",
        s.placement === 1 ? "✓ WINNER" : "ELIMINATED"
      ];
    }
    return [
      `#${s.placement}`,
      team?.name || "Unknown",
      s.kills || 0,
      s.placementPts || 0,
      s.totalPoints || 0
    ];
  });

  autoTable(doc, {
    startY: 45,
    head: head,
    body: body,
    theme: 'striped',
    headStyles: { fillColor: [239, 68, 68], halign: 'center' },
    columnStyles: isCS ? {
      0: { halign: 'center', cellWidth: 25 }, // Rank width increased
      1: { halign: 'left' },
      2: { halign: 'center', cellWidth: 40 }
    } : {
      0: { halign: 'center', cellWidth: 25 }, // Rank width increased
      1: { halign: 'left' },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 30 },
      4: { halign: 'center', fontStyle: 'bold', cellWidth: 30 }
    },
    styles: { fontSize: 10, cellPadding: 5 },
    margin: { top: 45 }
  });

  doc.save(`Match_${match.matchNumber}_Result_${new Date().getTime()}.pdf`);
}

/**
 * Export all matches of a day in one PDF (Multi-page)
 */
export async function exportAllMatchesAsPDF(
  allMatchesWithStandings: any[],
  dayName: string,
  tournamentName: string = "Arena Ace Tournament",
  getTeamById: (id: string) => any
): Promise<void> {
  const doc = new jsPDF();
  const timestamp = new Date().toLocaleString();

  allMatchesWithStandings.forEach((data, index) => {
    const { match, standings } = data;
    const isCS = match.type === 'cs-bracket' || match.name?.toLowerCase().includes('cs');

    if (index > 0) doc.addPage();

    // Header per page
    doc.setFillColor(26, 26, 26);
    doc.rect(0, 0, 210, 35, "F");
    
    doc.setTextColor(255, 70, 70);
    doc.setFontSize(18);
    doc.text(tournamentName.toUpperCase(), 105, 12, { align: "center" });
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text(`${match.name || `Match ${match.matchNumber}`} - ${dayName}`, 105, 22, { align: "center" });
    
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`Generated: ${timestamp} • Page ${index + 1}`, 105, 30, { align: "center" });

    // Table
    const head = isCS 
      ? [['RANK', 'TEAM', 'RESULT']]
      : [['RANK', 'TEAM', 'KILLS', 'PLACE PTS', 'TOTAL PTS']];

    const body = standings.map((s: any) => {
      const team = getTeamById(s.teamId);
      if (isCS) {
        return [`#${s.placement}`, team?.name || "Unknown", s.placement === 1 ? "WINNER" : "ELIMINATED"];
      }
      return [`#${s.placement}`, team?.name || "Unknown", s.kills, s.placementPts, s.totalPoints];
    });

    autoTable(doc, {
      startY: 40,
      head: head,
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68] },
      columnStyles: {
        0: { halign: 'center', cellWidth: 25 },
        1: { halign: 'left' }
      },
      styles: { fontSize: 9 }
    });
  });

  doc.save(`All_Matches_${dayName.replace(/\s+/g, '_')}_Results.pdf`);
}
