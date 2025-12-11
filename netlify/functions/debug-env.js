exports.handler = async function (event, context) {
  const useFirebase = process.env.USE_FIREBASE === 'true';
  const saRaw = process.env.FIREBASE_SERVICE_ACCOUNT || null;
  let project_id = null;
  let saValid = false;
  if (saRaw) {
    try {
      const sa = JSON.parse(saRaw);
      project_id = sa.project_id || null;
      saValid = true;
    } catch (e) {
      project_id = 'INVALID_JSON';
      saValid = false;
    }
  }

  const payload = {
    USE_FIREBASE: useFirebase,
    FIREBASE_SERVICE_ACCOUNT_SET: !!saRaw,
    FIREBASE_SERVICE_ACCOUNT_VALID_JSON: saValid,
    PROJECT_ID: project_id,
    NETLIFY: !!process.env.NETLIFY,
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  };
};
