#!/usr/bin/env node

/**
 * Sample Incident Data Generator
 * Generates simulated emergency incidents for testing
 * 
 * Usage: node scripts/generateIncidents.js [count]
 * Example: node scripts/generateIncidents.js 10
 */

const API_URL = process.env.API_URL || "http://localhost:5001/api";

// Delhi/NCR region coordinates
const REGION = {
  centerLat: 28.6139,
  centerLng: 77.209,
  radiusKm: 30,
};

// Sample incident templates
const incidentTemplates = [
  // High severity
  { title: "Building Fire", description: "Large fire reported in residential building, multiple floors affected. Smoke visible from distance.", severity: "high" },
  { title: "Major Traffic Accident", description: "Multi-vehicle collision on highway. Several people trapped in vehicles, ambulance required immediately.", severity: "high" },
  { title: "Medical Emergency - Cardiac Arrest", description: "65-year-old male experiencing cardiac arrest. CPR in progress, need immediate medical response.", severity: "high" },
  { title: "Armed Robbery in Progress", description: "Armed suspects reported inside bank. Multiple hostages, police response required immediately.", severity: "high" },
  { title: "Gas Leak Emergency", description: "Major gas leak detected in apartment complex. Strong smell of gas, evacuation in progress.", severity: "high" },
  { title: "Structure Collapse", description: "Partial building collapse at construction site. Workers potentially trapped under debris.", severity: "high" },
  
  // Medium severity
  { title: "Minor Road Accident", description: "Two-car collision at intersection. Minor injuries reported, traffic backup forming.", severity: "medium" },
  { title: "Residential Burglary", description: "Break-in reported at residence. Suspects fled scene, homeowner requesting police.", severity: "medium" },
  { title: "Small Kitchen Fire", description: "Kitchen fire in apartment, contained to one room. Fire extinguisher used, smoke in building.", severity: "medium" },
  { title: "Assault Reported", description: "Physical altercation between two individuals. One person with minor injuries, aggressor left scene.", severity: "medium" },
  { title: "Water Main Break", description: "Water main burst flooding street. Traffic affected, utility company notified.", severity: "medium" },
  { title: "Medical - Fall Injury", description: "Elderly person fell down stairs. Conscious but complaining of hip pain, unable to move.", severity: "medium" },
  
  // Low severity
  { title: "Noise Complaint", description: "Loud music from neighboring apartment. Multiple complaints from residents.", severity: "low" },
  { title: "Parking Violation", description: "Vehicle blocking driveway. Owner unable to exit, requesting assistance.", severity: "low" },
  { title: "Lost Pet", description: "Dog escaped from yard, owner searching neighborhood. Golden retriever with blue collar.", severity: "low" },
  { title: "Minor Property Damage", description: "Vandalism to parked vehicle. Scratches on side panel, no suspects seen.", severity: "low" },
  { title: "Suspicious Activity", description: "Unknown person seen looking into car windows. No theft reported yet.", severity: "low" },
  { title: "Medical Transport Request", description: "Non-emergency medical transport needed for dialysis appointment.", severity: "low" },
];

/**
 * Generate random coordinates within the region
 */
function generateRandomLocation() {
  // Convert km to degrees (approximate)
  const radiusDeg = REGION.radiusKm / 111;
  
  const lat = REGION.centerLat + (Math.random() - 0.5) * 2 * radiusDeg;
  const lng = REGION.centerLng + (Math.random() - 0.5) * 2 * radiusDeg;
  
  return { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
}

/**
 * Generate a single incident
 */
function generateIncident(useAI = false) {
  const template = incidentTemplates[Math.floor(Math.random() * incidentTemplates.length)];
  const location = generateRandomLocation();
  
  return {
    title: template.title,
    description: template.description,
    lat: location.lat,
    lng: location.lng,
    // If useAI is true, don't include severity (let API classify it)
    ...(useAI ? {} : { severity: template.severity }),
  };
}

/**
 * Send incident to API
 */
async function createIncident(incident) {
  try {
    const response = await fetch(`${API_URL}/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incident),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ Failed to create incident: ${error.message}`);
    return null;
  }
}

/**
 * Main function
 */
async function main() {
  const count = parseInt(process.argv[2]) || 5;
  const useAI = process.argv.includes("--ai");
  
  console.log(`\n🚨 Emergency Incident Generator`);
  console.log(`================================`);
  console.log(`Generating ${count} incidents...`);
  console.log(`AI Classification: ${useAI ? "Enabled" : "Disabled"}\n`);
  
  let created = 0;
  let failed = 0;
  
  for (let i = 0; i < count; i++) {
    const incident = generateIncident(useAI);
    console.log(`[${i + 1}/${count}] Creating: ${incident.title}`);
    
    const result = await createIncident(incident);
    
    if (result) {
      console.log(`   ✅ Created with severity: ${result.severity || "pending"}`);
      created++;
    } else {
      failed++;
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n================================`);
  console.log(`✅ Created: ${created}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`================================\n`);
}

// Run if called directly
main().catch(console.error);

module.exports = { generateIncident, incidentTemplates };
