import { createCA, createCert } from "mkcert";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

let targetIP = "";
let outDir = process.cwd();

const numArgs = process.argv.length;

if (numArgs < 3) {
  console.error(`Usage: gencerts <domain> [output_dir: default=.]`);
  process.exit(1);
} else if (numArgs == 3) {
  targetIP = process.argv[2];
} else if (numArgs == 4) {
  targetIP = process.argv[2];
  outDir = path.resolve(process.argv[3]);
  if (!existsSync(outDir)) {
    await mkdir(outDir);
  }
} else {
  console.error("Too many arguments");
  console.error(`Usage: gencerts <domain> [output_dir: default=.]`);
  process.exit(1);
}

const domains = ["127.0.0.1", "localhost"];

const filepaths = {
  rootCA: path.join(outDir, "rootca.crt"),
  rootCAKey: path.join(outDir, "rootca.key"),
  certFile: path.join(outDir, "certfile.crt"),
  keyFile: path.join(outDir, "keyfile.key"),
};

// Append target IP to supported domains
if (targetIP && targetIP !== "localhost" && targetIP !== "127.0.0.1") {
  domains.push(targetIP);
}

console.log("Generating self-signed certs for domains", domains);

// create a certificate authority
const ca = await createCA({
  organization: "Yo Medical Files(U) Ltd",
  countryCode: "UG",
  state: "Kla",
  locality: "Kampala",
  validityDays: 3650,
});

// save ca to disk
await writeFile(filepaths.rootCA, ca.cert);
await writeFile(filepaths.rootCAKey, ca.key);

// then create a tls certificate
const cert = await createCert({
  domains,
  validityDays: 3650,
  caKey: ca.key,
  caCert: ca.cert,
});

// save the certificates to disk
await writeFile(filepaths.certFile, cert.cert);
await writeFile(filepaths.keyFile, cert.key);
