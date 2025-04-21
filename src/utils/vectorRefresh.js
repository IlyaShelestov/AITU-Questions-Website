const axios = require("axios");
const { LLM_API_URL } = process.env;

let refreshTimers = {
  staff: null,
  students: null,
};

let pendingRefresh = {
  staff: false,
  students: false,
};

function scheduleVectorRefresh(audience) {
  if (refreshTimers[audience]) {
    clearTimeout(refreshTimers[audience]);
  }

  pendingRefresh[audience] = true;

  console.log(
    `[Vector Refresh] Scheduled refresh for ${audience} in 5 minutes`
  );

  refreshTimers[audience] = setTimeout(async () => {
    try {
      await refreshVectors(audience);
      pendingRefresh[audience] = false;
    } catch (error) {
      console.error(
        `[Vector Refresh] Failed to refresh vectors for ${audience}:`,
        error
      );
      pendingRefresh[audience] = false;
    }
  }, 5 * 60 * 1000);
}

async function refreshVectors(audience) {
  const endpoint = `${LLM_API_URL}/refresh/${audience}`;
  console.log(`[Vector Refresh] Refreshing vectors for ${audience}...`);

  try {
    const response = await axios.post(endpoint);
    console.log(
      `[Vector Refresh] Successfully refreshed vectors for ${audience}:`,
      response.data
    );
    return response.data;
  } catch (error) {
    console.error(
      `[Vector Refresh] Error refreshing vectors for ${audience}:`,
      error
    );
    throw error;
  }
}

function isRefreshPending(audience) {
  return pendingRefresh[audience];
}

module.exports = {
  scheduleVectorRefresh,
  refreshVectors,
  isRefreshPending,
};
