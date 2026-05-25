const baseMongoUri = (process.env.MONGODB_BASE_URI || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/").replace(/\/?$/, "/");

function withDatabase(uri, dbName, extraParams = {}) {
  const url = new URL(uri);
  url.pathname = `/${dbName}`;
  Object.entries(extraParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

function tenantDbName(accountNumber) {
  return `saas_app_rb_${accountNumber}`;
}

function tenantDbUri(accountNumber) {
  return withDatabase(baseMongoUri, tenantDbName(accountNumber), { directConnection: 'true' });
}

function adminDbUri() {
  return withDatabase(baseMongoUri, 'admin', { authSource: 'admin', directConnection: 'true' });
}

const globalDbUri = process.env.GLOBAL_DB_URI || withDatabase(baseMongoUri, 'saasDemo', { directConnection: 'true' });

module.exports = {
  globalDbUri: globalDbUri,
  uri: baseMongoUri,
  tenantDbName,
  tenantDbUri,
  adminDbUri,
};
