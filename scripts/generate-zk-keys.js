#!/usr/bin/env node

/**
 * Generate ZK circuit artifacts for Privacy Mixer
 * 
 * This script:
 * 1. Compiles the Circom circuit
 * 2. Generates trusted setup (powers of tau)
 * 3. Creates proving and verification keys
 * 4. Exports Solidity verifier contract
 * 
 * Requirements:
 * - circom installed globally: npm install -g circom
 * - snarkjs available (via npx or npm install)
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

const CIRCUITS_DIR = join(PROJECT_ROOT, "circuits");
const BUILD_DIR = join(CIRCUITS_DIR, "build");
const CIRCUIT_FILE = join(CIRCUITS_DIR, "withdraw.circom");
const PTAU_FILE = join(CIRCUITS_DIR, "powersOfTau28_hez_final_10.ptau");
const PTAU_URL = "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau";

console.log("🔐 ZK Circuit Setup Script");
console.log("==========================\n");

// Check if circuit file exists
if (!existsSync(CIRCUIT_FILE)) {
  console.error(`❌ Circuit file not found: ${CIRCUIT_FILE}`);
  process.exit(1);
}

// Create build directory
if (!existsSync(BUILD_DIR)) {
  mkdirSync(BUILD_DIR, { recursive: true });
  console.log(`✅ Created build directory: ${BUILD_DIR}`);
}

try {
  // Step 1: Compile circuit
  console.log("\n📦 Step 1: Compiling circuit...");
  console.log("   Using circom2...");
  // Ensure build directory exists
  if (!existsSync(BUILD_DIR)) {
    mkdirSync(BUILD_DIR, { recursive: true });
  }
  // Compile from circuits directory with proper include paths
  const circuitFileName = "withdraw.circom";
  const nodeModulesPath = join(PROJECT_ROOT, "node_modules");
  // Use forward slashes for Windows compatibility in paths
  const includePath = nodeModulesPath.replace(/\\/g, "/");
  execSync(
    `npx circom2 "${circuitFileName}" --r1cs --wasm --sym -o "${BUILD_DIR.replace(/\\/g, "/")}" -l "${includePath}"`,
    { stdio: "inherit", cwd: CIRCUITS_DIR, shell: true }
  );
  console.log("✅ Circuit compiled successfully");

  // Step 2: Download powers of tau (if not exists)
  if (!existsSync(PTAU_FILE)) {
    console.log("\n📥 Step 2: Downloading powers of tau file...");
    console.log("   This may take a few minutes (~800MB)...");
    try {
      // Try using PowerShell's Invoke-WebRequest for Windows
      const isWindows = process.platform === "win32";
      if (isWindows) {
        console.log("   Using PowerShell to download...");
        execSync(
          `powershell -Command "Invoke-WebRequest -Uri '${PTAU_URL}' -OutFile '${PTAU_FILE}'"`,
          { stdio: "inherit", cwd: PROJECT_ROOT }
        );
      } else {
        execSync(
          `curl -L -o "${PTAU_FILE}" "${PTAU_URL}"`,
          { stdio: "inherit", cwd: PROJECT_ROOT }
        );
      }
      // Verify file size (should be ~800MB)
      const stats = fs.statSync(PTAU_FILE);
      const fileSizeMB = stats.size / (1024 * 1024);
      if (fileSizeMB < 100) {
        throw new Error(`Downloaded file too small (${fileSizeMB.toFixed(2)}MB). Expected ~800MB.`);
      }
      console.log(`✅ Powers of tau downloaded (${fileSizeMB.toFixed(2)}MB)`);
    } catch (error) {
      console.error("❌ Failed to download powers of tau");
      console.error(`   Error: ${error.message}`);
      console.error("   You can download it manually from:");
      console.error(`   ${PTAU_URL}`);
      console.error(`   And save it to: ${PTAU_FILE}`);
      console.error("\n   Or use this PowerShell command:");
      console.error(`   Invoke-WebRequest -Uri "${PTAU_URL}" -OutFile "${PTAU_FILE}"`);
      process.exit(1);
    }
  } else {
    console.log("\n✅ Step 2: Powers of tau file already exists");
  }

  // Step 3: Generate Groth16 setup
  console.log("\n🔧 Step 3: Generating Groth16 trusted setup...");
  const r1csFile = join(BUILD_DIR, "withdraw.r1cs");
  const zkeyFile = join(BUILD_DIR, "withdraw_0000.zkey");
  
  execSync(
    `npx snarkjs groth16 setup "${r1csFile}" "${PTAU_FILE}" "${zkeyFile}"`,
    { stdio: "inherit", cwd: PROJECT_ROOT }
  );
  console.log("✅ Initial zkey generated");

  // Step 4: Contribute to ceremony (optional but recommended)
  console.log("\n🎲 Step 4: Contributing to trusted setup ceremony...");
  console.log("   (This adds randomness to the setup)");
  const finalZkeyFile = join(BUILD_DIR, "withdraw_final.zkey");
  
  // For automated setup, we'll use a random contribution
  // In production, you'd want multiple parties to contribute
  try {
    execSync(
      `npx snarkjs zkey contribute "${zkeyFile}" "${finalZkeyFile}" --name="PrivacyMixer"`,
      { stdio: "inherit", cwd: PROJECT_ROOT, input: "\n" }
    );
    console.log("✅ Contribution added");
  } catch (error) {
    // If contribute fails (needs interactive input), just copy the initial zkey
    console.log("⚠️  Skipping contribution (requires interactive input)");
    console.log("   Using initial zkey as final zkey");
    const fs = await import("fs");
    fs.copyFileSync(zkeyFile, finalZkeyFile);
  }

  // Step 5: Export verification key
  console.log("\n🔑 Step 5: Exporting verification key...");
  const vkeyFile = join(BUILD_DIR, "verification_key.json");
  
  execSync(
    `npx snarkjs zkey export verificationkey "${finalZkeyFile}" "${vkeyFile}"`,
    { stdio: "inherit", cwd: PROJECT_ROOT }
  );
  console.log("✅ Verification key exported");

  // Step 6: Export Solidity verifier
  console.log("\n📄 Step 6: Exporting Solidity verifier contract...");
  const verifierFile = join(PROJECT_ROOT, "contracts", "verifiers", "Groth16Verifier.sol");
  
  execSync(
    `npx snarkjs zkey export solidityverifier "${finalZkeyFile}" "${verifierFile}"`,
    { stdio: "inherit", cwd: PROJECT_ROOT }
  );
  console.log(`✅ Verifier contract exported to: ${verifierFile}`);

  console.log("\n🎉 ZK Setup Complete!");
  console.log("\n📋 Generated files:");
  console.log(`   - Circuit WASM: ${join(BUILD_DIR, "withdraw_js", "withdraw.wasm")}`);
  console.log(`   - Proving Key: ${finalZkeyFile}`);
  console.log(`   - Verification Key: ${vkeyFile}`);
  console.log(`   - Verifier Contract: ${verifierFile}`);
  console.log("\n✅ You can now deploy the verifier contract and use ZK proofs!");

} catch (error) {
  console.error("\n❌ Error during ZK setup:", error.message);
  console.error("\nTroubleshooting:");
  console.error("1. Make sure circom is installed: npm install -g circom");
  console.error("2. Make sure snarkjs is available: npm install snarkjs");
  console.error("3. Check that the circuit file compiles without errors");
  process.exit(1);
}
