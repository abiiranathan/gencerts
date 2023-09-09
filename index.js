const mkcert = require("mkcert");
const fs = require("fs/promises");

const targetIP = process.argv[2];
const domains = ["127.0.0.1", "localhost"];

const filepaths = {
  rootCA: "rootca.crt",
  rootCAKey: "rootca.key",
  certFile: "certfile.crt",
  keyFile: "keyfile.key",
};

if (targetIP && targetIP !== "localhost" && targetIP !== "127.0.0.1") {
  domains.push(targetIP);
}

console.log("Generating self-signed certs for domains", domains);

async function start() {
  // create a certificate authority
  const ca = await mkcert.createCA({
    organization: "Yo Medical Files(U) Ltd",
    countryCode: "UG",
    state: "Kla",
    locality: "Kampala",
    validityDays: 3650,
  });

  // save ca to disk
  await fs.writeFile(filepaths.rootCA, ca.cert);
  await fs.writeFile(filepaths.rootCAKey, ca.key);

  // then create a tls certificate
  const cert = await mkcert.createCert({
    domains,
    validityDays: 3650,
    caKey: ca.key,
    caCert: ca.cert,
  });

  // save the certificates to disk
  await fs.writeFile(filepaths.certFile, cert.cert);
  await fs.writeFile(filepaths.keyFile, cert.key);
}

start();
