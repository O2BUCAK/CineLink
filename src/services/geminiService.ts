export const getNewChallenge = async (): Promise<{ start: string; end: string; warning?: string }> => {
  const response = await fetch("/api/challenge");
  if (!response.ok) {
    throw new Error("Meydan okuma alınamadı. Lütfen tekrar deneyin.");
  }
  return response.json();
};

export const verifyLink = async (from: string, to: string): Promise<{ isValid: boolean; explanation: string }> => {
  const response = await fetch("/api/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to }),
  });
  if (!response.ok) {
    throw new Error("Bağlantı doğrulanamadı.");
  }
  return response.json();
};

export const calculateShortestPath = async (
  start: string,
  end: string,
  userChainLength: number
): Promise<{ shortest: number; path: string[] }> => {
  try {
    const response = await fetch("/api/shortest-path", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ start, end, userChainLength }),
    });
    if (!response.ok) {
      return { shortest: Math.max(1, Math.floor(userChainLength * 0.75)), path: [] };
    }
    return response.json();
  } catch (err) {
    return { shortest: Math.max(1, Math.floor(userChainLength * 0.75)), path: [] };
  }
};
